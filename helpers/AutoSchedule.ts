import { getDatabase, ref, get } from "firebase/database";

type Worker = {
    maxWorkDays: number;
    expertises: string[];
};

export async function fetchWorkersFromFirebase(): Promise<Record<string, Worker>> {
    const db = getDatabase();
    const skiTeamRef = ref(db, "users/ski-team");
    const snapshot = await get(skiTeamRef);
    if (!snapshot.exists()) {
        throw new Error("No worker data available in Firebase");
    }
    const fetchedData = snapshot.val();
    const firebaseWorkers: Record<string, Worker> = {};
    for (const uid in fetchedData) {
        const userData = fetchedData[uid];
        const maxWorkDays = userData.maxWorkDays;
        const expertises = userData.certifications 
            ? Object.keys(userData.certifications).filter(cert => userData.certifications[cert].exists).map(cert => userData.certifications[cert].type)
            : [];
        firebaseWorkers[uid] = { maxWorkDays, expertises };
    }
    return firebaseWorkers;
}

export async function fetchDateToWorkersFromFirebase(): Promise<Record<string, string[]>> {
    const db = getDatabase();
    const activitiesRef = ref(db, "activities");
    const snapshot = await get(activitiesRef);
    const fetchedData = snapshot.val();
    const initializedActivities = Object.keys(fetchedData).reduce((acc, date) => {
        if (fetchedData[date].status === 'initialized') {
            acc[date] = fetchedData[date];
        }
        return acc;
    }, {} as Record<string, any>);
    if (!snapshot.exists()) {
        throw new Error("No activity data available in Firebase");
    }
    const firebaseDateToWorkers: Record<string, string[]> = {};
    for (const date in initializedActivities) {
        const availableVolunteersDict = initializedActivities[date].availableVolunteers || {};
        const availableVolunteers = Object.values(availableVolunteersDict) as string[];
        firebaseDateToWorkers[date] = availableVolunteers;
    }
    return firebaseDateToWorkers;
}

type Schedule = {
    roles: Record<string, string[]>;
    workers: string[];
    replaceableWorkers: string[];
    expertises: Record<string, number>;
};

let workers: Record<string, Worker> = {};
let dateToWorkers: Record<string, string[]> = {};

// Fetch workers and dateToWorkers from Firebase
Promise.all([fetchWorkersFromFirebase(), fetchDateToWorkersFromFirebase()]).then(([fetchedWorkers, fetchedDateToWorkers]) => {
    workers = fetchedWorkers;
    dateToWorkers = fetchedDateToWorkers;
});

export async function autoSchedule(
    workersOrigin: Record<string, Worker> = {},
    dateToWorkersOrigin: Record<string, string[]> = {},
    mandatoryExpertises: Record<string, number> = { 'driver': 1, 'activity_manager': 1, 'skipper': 2 },
    numOfWorkersPerDay: number = 5
): Promise<Record<string, Schedule>> {
    if (Object.keys(workersOrigin).length === 0) {
        workersOrigin = await fetchWorkersFromFirebase();
    }
    if (Object.keys(dateToWorkersOrigin).length === 0) {
        dateToWorkersOrigin = await fetchDateToWorkersFromFirebase();
    }

    for (const date in dateToWorkersOrigin) {
        dateToWorkers[date] = [...dateToWorkersOrigin[date]];
    }

    workers = JSON.parse(JSON.stringify(workersOrigin));
    
    const schedule: Record<string, Schedule> = {};
    
    const sortedActivityDates = Object.keys(dateToWorkers)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .sort((a, b) => dateToWorkers[a].length - dateToWorkers[b].length);
    
    for (const date of sortedActivityDates) {
        schedule[date] = { workers: [], replaceableWorkers: [], expertises: {}, roles: {} };
        let availableWorkers = [...dateToWorkers[date]].filter(worker => workers[worker].maxWorkDays > 0);
        
        availableWorkers.sort((a, b) => a.localeCompare(b))
            .sort((a, b) => {
                const availableDaysA = Object.keys(dateToWorkers).filter(d => dateToWorkers[d].includes(a)).length;
                const availableDaysB = Object.keys(dateToWorkers).filter(d => dateToWorkers[d].includes(b)).length;
                return (availableDaysA / workers[a].maxWorkDays || Infinity) - (availableDaysB / workers[b].maxWorkDays || Infinity);
            });
        
        let expertisesToBook = Object.keys(mandatoryExpertises)
            .sort()
            .reduce((acc, key) => {
                acc[key] = mandatoryExpertises[key];
                return acc;
            }, {} as Record<string, number>);
        let numOfWorkersLeft = numOfWorkersPerDay;
        for (const expertise in expertisesToBook) {
            let workersWithExpertise = availableWorkers.filter(worker => workers[worker].expertises.includes(expertise));
            for (const worker of workersWithExpertise) {
                if (expertisesToBook[expertise] > 0) {
                    availableWorkers = availableWorkers.filter(w => w !== worker);
                    workers[worker].maxWorkDays--;
                    for (const workerExpertise of workers[worker].expertises) {
                        expertisesToBook[workerExpertise]--;
                    }
                    numOfWorkersLeft--;
                    schedule[date].workers.push(worker);
                }
            }
            if (expertisesToBook[expertise] > 0) {
                console.log(`No more workers with expertise ${expertise} on date ${date}`);
            }

        }

        // Book the rest of the workers
        const numOfWorkersLeftCopy = numOfWorkersLeft
        for (let i = 0; i < numOfWorkersLeftCopy; i++) {
            if (availableWorkers.length > 0) {
                const worker = availableWorkers.shift()!;
                workers[worker].maxWorkDays--;
                
                for (const workerExpertise of workers[worker].expertises) {
                    expertisesToBook[workerExpertise]--;
                }
                
                schedule[date].workers.push(worker);
                numOfWorkersLeft--;
            }
        }

        delete dateToWorkers[date];
        
        for (const worker of schedule[date].workers) {
            let isReplaceable = true;
            for (const workerExpertise of workers[worker].expertises) {
                if (expertisesToBook[workerExpertise] >= 0) {
                    isReplaceable = false;
                    break;
                }
            }
            if (isReplaceable) {
                schedule[date].replaceableWorkers.push(worker);
            }
        }
        
        schedule[date].expertises = expertisesToBook;
    }

    // Check if there are workers that can be replaced to complete the missing expertises
    for (const date in schedule) {
        for (const expertise in schedule[date].expertises) {
            if (schedule[date].expertises[expertise] > 0) {
                let replaced = false;
                const workersWithExpertise = Object.keys(workers).filter(
                    worker =>
                        workers[worker].expertises.includes(expertise) &&
                    dateToWorkersOrigin[date]?.includes(worker) &&
                        !schedule[date].workers.includes(worker)
                );
                for (const worker of workersWithExpertise) {
                    if (!replaced) {
                        const scheduledDates = Object.keys(schedule).filter(
                            scheduledDate => schedule[scheduledDate].workers.includes(worker)
                        );

                        for (const scheduledDate of scheduledDates) {
                            const workersToReplace = schedule[date].replaceableWorkers.filter(
                                replacableWorker =>
                                    !schedule[scheduledDate].workers.includes(replacableWorker) &&
                                dateToWorkersOrigin[scheduledDate]?.includes(replacableWorker)
                            );

                            if (
                                schedule[scheduledDate].replaceableWorkers.includes(worker) &&
                                workersToReplace.length > 0
                            ) {
                                replaceWorkers(
                                    worker,
                                    scheduledDate,
                                    workersToReplace[0],
                                    date,
                                    schedule,
                                    workers
                                );
                                replaced = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    // add roles
    for (const date in schedule) {
        let expertisesToBook: Record<string, number> = Object.keys(mandatoryExpertises).reduce((acc, key) => {
            acc[key] = mandatoryExpertises[key];
            return acc;
        }, {} as Record<string, number>);
        for (const worker of schedule[date].workers) {
            for (const workerExpertise of workersOrigin[worker].expertises) {
                expertisesToBook[workerExpertise]--;
                if (!schedule[date].roles[worker]) {
                    schedule[date].roles[worker] = [];
                }
                if (expertisesToBook[workerExpertise] >= 0) {
                    schedule[date].roles[worker].push(workerExpertise);
                }
            }
        }
    }
    
    for (const date in schedule) {
        console.log(`${date}: ${schedule[date].workers}`);
    }
    return schedule;
}

export async function analyzeSchedule(
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker> = {},
    dateToWorkers: Record<string, string[]> = {},
    mandatoryExpertises: Record<string, number> = { 'driver': 1, 'activity_manager': 1, 'skipper': 2 },
    numOfWorkersPerDay: number = 5
): Promise<string[]> {
    if (Object.keys(workers).length === 0) {
        workers = await fetchWorkersFromFirebase(); // Ensure this is inside an async function
    }
    if (Object.keys(dateToWorkers).length === 0) {
        dateToWorkers = await fetchDateToWorkersFromFirebase(); // Ensure this is inside an async function
    }
    const issues: string[] = [];
    for (const date in schedule) {
        const daySchedule = schedule[date];
        const scheduledWorkers = daySchedule.workers;

        // Check if the number of workers is correct
        if (scheduledWorkers.length !== numOfWorkersPerDay) {
            issues.push(
                `Wrong number of workers on date ${date}. Expected: ${numOfWorkersPerDay}, Got: ${scheduledWorkers.length}.`
            );
        }

        // Check if the workers are in the dateToWorkers
        for (const worker of scheduledWorkers) {
            if (!dateToWorkers[date]?.includes(worker)) {
                issues.push(`Worker ${worker} was not signed up for date ${date}.`);
            }
        }

        // Check if the workers have the required expertises
        const mandatoryExpertisesCopy = { ...mandatoryExpertises };
        for (const worker of scheduledWorkers) {
            for (const expertise of workers[worker].expertises) {
                if (mandatoryExpertisesCopy[expertise] !== undefined) {
                    mandatoryExpertisesCopy[expertise]--;
                }
            }
        }
        for (const expertise in mandatoryExpertisesCopy) {
            if (mandatoryExpertisesCopy[expertise] > 0) {
                issues.push(`Date ${date} does not have the required expertise "${expertise}".`);
            }
        }
    }

    // Check if the workers have more workdays than allowed
    for (const workerId in workers) {
        const maxWorkDays = workers[workerId].maxWorkDays;
        const scheduledDays = Object.keys(schedule).filter(date => schedule[date].workers.includes(workerId)).length;
        if (scheduledDays > maxWorkDays) {
            issues.push(
                `Worker ${workerId} has more workdays (${scheduledDays}) than allowed (${maxWorkDays}).`
            );
        }
    }
    // print the issues
    console.log("Issues found in the schedule:");
    for (const issue of issues) {
        console.log(issue);
    }
    return issues;
}

export function replaceWorkers(
    worker1: string,
    date1: string,
    worker2: string,
    date2: string,
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker>
): void {
    if (
        !schedule[date2].workers.includes(worker1) &&
        !schedule[date1].workers.includes(worker2) &&
        schedule[date1].replaceableWorkers.includes(worker1) &&
        schedule[date2].replaceableWorkers.includes(worker2) &&
        schedule[date1].workers.includes(worker1) &&
        schedule[date2].workers.includes(worker2)
    ) {
        console.log(`Replaced ${worker1} with ${worker2} in ${date1} and ${date2}`);
        // Swap workers between dates
        schedule[date1].workers = schedule[date1].workers.filter(w => w !== worker1);
        schedule[date1].workers.push(worker2);
        schedule[date2].workers = schedule[date2].workers.filter(w => w !== worker2);
        schedule[date2].workers.push(worker1);

        // Update replaceable workers
        schedule[date1].replaceableWorkers = schedule[date1].replaceableWorkers.filter(w => w !== worker1);
        schedule[date2].replaceableWorkers = schedule[date2].replaceableWorkers.filter(w => w !== worker2);

        // Update expertises for date1
        for (const expertise in schedule[date1].expertises) {
            if (workers[worker1].expertises.includes(expertise)) {
                schedule[date1].expertises[expertise]++;
            }
            if (workers[worker2].expertises.includes(expertise)) {
                schedule[date1].expertises[expertise]--;
            }
        }

        // Update expertises for date2
        for (const expertise in schedule[date2].expertises) {
            if (workers[worker2].expertises.includes(expertise)) {
                schedule[date2].expertises[expertise]++;
            }
            if (workers[worker1].expertises.includes(expertise)) {
                schedule[date2].expertises[expertise]--;
            }
        }
    } else {
        console.log(
            `A replacement of ${worker1} with ${worker2} in ${date1} and ${date2} is not possible`
        );
    }
}