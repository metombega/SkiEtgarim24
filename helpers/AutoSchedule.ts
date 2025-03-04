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

export async function autoSchedule(workers: Record<string, Worker> = {}, dateToWorkers: Record<string, string[]> = {}): Promise<Record<string, Schedule>> {
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
        schedule[date] = { workers: [], replaceableWorkers: [], expertises: {} };
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