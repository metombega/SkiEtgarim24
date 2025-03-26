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

const mandatoryExpertises: Record<string, number> = { 'driver': 1, 'activity_manager': 1, 'skipper': 2 };
const numOfWorkersPerDay = 5;

export async function autoSchedule(workersOrigin: Record<string, Worker> = {}, dateToWorkersOrigin: Record<string, string[]> = {}): Promise<Record<string, Schedule>> {
    for (const date in dateToWorkersOrigin) {
        dateToWorkers[date] = [...dateToWorkersOrigin[date]];
    }
    workers = JSON.parse(JSON.stringify(workersOrigin));

    if (Object.keys(workers).length === 0) {
        workers = await fetchWorkersFromFirebase();
    }
    if (Object.keys(dateToWorkers).length === 0) {
        dateToWorkers = await fetchDateToWorkersFromFirebase();
    }

    const schedule: Record<string, Schedule> = {};
    
    const sortedActivityDates = Object.keys(dateToWorkers)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .sort((a, b) => dateToWorkers[a].length - dateToWorkers[b].length);
    
    for (const date of sortedActivityDates) {
        schedule[date] = { workers: [], replaceableWorkers: [], expertises: {}, roles: {} };
        let availableWorkers = [...dateToWorkers[date]];
        
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
        let numOfWorkersBooked = numOfWorkersPerDay;
        
        for (const expertise in expertisesToBook) {
            let workersWithExpertise = availableWorkers.filter(worker => workers[worker].expertises.includes(expertise));
            while (expertisesToBook[expertise] > 0) {
                if (workersWithExpertise.length > 0) {
                    const worker = workersWithExpertise.shift()!;
                    availableWorkers = availableWorkers.filter(w => w !== worker);
                    workers[worker].maxWorkDays--;
                    
                    for (const workerExpertise of workers[worker].expertises) {
                        expertisesToBook[workerExpertise]--;
                        if (!schedule[date].roles[worker]) {
                            schedule[date].roles[worker] = [];
                        }
                        if (expertisesToBook[workerExpertise] >= 0) {
                            schedule[date].roles[worker].push(workerExpertise);
                        }

                    }
                    numOfWorkersBooked--;
                    schedule[date].workers.push(worker);
                } else {
                    console.log(`No more workers with expertise ${expertise} on date ${date}`);
                    break;
                }
            }
        }
        
        let expertisesNotBooked = Object.values(expertisesToBook).reduce((acc, val) => acc + (val > 0 ? val : 0), 0);
        
        while (numOfWorkersBooked > expertisesNotBooked && availableWorkers.length > 0) {
            const worker = availableWorkers.shift()!;
            workers[worker].maxWorkDays--;
            
            for (const workerExpertise of workers[worker].expertises) {
                expertisesToBook[workerExpertise]--;
            }
            
            schedule[date].workers.push(worker);
            numOfWorkersBooked--;
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
    
    for (const date in schedule) {
        console.log(`${date}: ${schedule[date].workers}`);
    }
    return schedule;
}

export function analyzeSchedule(
    workers: Record<string, Worker>,
    dateToWorkers: Record<string, string[]>,
    schedule: Record<string, Schedule>
): string[] {
    const issues: string[] = [];
    console.log(workers);
    console.log(dateToWorkers);
    console.log(schedule);
    for (const date in schedule) {
        const daySchedule = schedule[date];
        const scheduledWorkers = daySchedule.workers;

        // Check if there are not enough workers for the day
        if (scheduledWorkers.length < numOfWorkersPerDay) {
            issues.push(`Date ${date}: Not enough workers. Scheduled: ${scheduledWorkers.length}, Required: ${numOfWorkersPerDay}.`);
        }

        // Check if there are missing expertises for the day
        const expertiseCount: Record<string, number> = {};
        for (const workerId of daySchedule.workers) {
            for (const expertise of workers[workerId].expertises) {
            expertiseCount[expertise] = (expertiseCount[expertise] || 0) + 1;
            }
        }

        for (const expertise in mandatoryExpertises) {
            const required = mandatoryExpertises[expertise];
            const available = expertiseCount[expertise] || 0;
            if (available < required) {
            issues.push(`Date ${date}: Missing expertise "${expertise}". Required: ${required}, Available: ${available}.`);
            }
        }

        // Check if a worker is scheduled for more days than allowed
        const workerScheduleCount: Record<string, number> = {};
        for (const date in schedule) {
            for (const workerId of schedule[date].workers) {
            workerScheduleCount[workerId] = (workerScheduleCount[workerId] || 0) + 1;
            }
        }

        for (const workerId in workerScheduleCount) {
            const scheduledDays = workerScheduleCount[workerId];
            const maxDays = workers[workerId]?.maxWorkDays || 0;
            if (scheduledDays > maxDays) {
            issues.push(`Worker ${workerId} is scheduled for ${scheduledDays} days, exceeding their allowed maximum of ${maxDays} days.`);
            }
        }

        // Check if a worker is scheduled for a day they did not accept
        for (const workerId of scheduledWorkers) {
            if (!dateToWorkers[date]?.includes(workerId)) {
                issues.push(`Worker ${workerId} is scheduled for date ${date}, but they did not accept to work on this day.`);
            }
        }
    }
    
    // remove duplicates
    return issues.filter((issue, index) => issues.indexOf(issue) === index);
}