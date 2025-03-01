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
        const maxWorkDays = userData.weekdayDays || 0;
        const expertises = userData.certifications 
            ? Object.keys(userData.certifications).filter(cert => userData.certifications[cert].exists) 
            : [];
        firebaseWorkers[uid] = { maxWorkDays, expertises };
    }
    return firebaseWorkers;
}

export async function fetchDateToWorkersFromFirebase(): Promise<Record<string, string[]>> {
    const db = getDatabase();
    const activitiesRef = ref(db, "activities");
    const snapshot = await get(activitiesRef);
    if (!snapshot.exists()) {
        throw new Error("No activity data available in Firebase");
    }
    const fetchedData = snapshot.val();
    const firebaseDateToWorkers: Record<string, string[]> = {};
    for (const date in fetchedData) {
        const availableVolunteersDict = fetchedData[date].availableVolunteers || {};
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
    console.log(workers);
    console.log(dateToWorkers);
});

// Commented out hardcoded dateToWorkers
// let dateToWorkers: Record<string, string[]> = {
//     "1/1/2025": ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
//     "2/1/2025": ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
//     "3/1/2025": ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
//     "4/1/2025": ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
//     "5/1/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
//     "6/1/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
// };

const mandatoryExpertises: Record<string, number> = { 'driver': 1};
const numOfWorkersPerDay = 5;

export function autoSchedule(): Record<string, Schedule> {
    const schedule: Record<string, Schedule> = {};
    
    const sortedActivityDates = Object.keys(dateToWorkers).sort((a, b) => dateToWorkers[a].length - dateToWorkers[b].length);
    
    for (const date of sortedActivityDates) {
        schedule[date] = { workers: [], replaceableWorkers: [], expertises: {} };
        let availableWorkers = [...dateToWorkers[date]];
        
        availableWorkers.sort((a, b) => {
            const availableDaysA = Object.keys(dateToWorkers).filter(d => dateToWorkers[d].includes(a)).length;
            const availableDaysB = Object.keys(dateToWorkers).filter(d => dateToWorkers[d].includes(b)).length;
            return (availableDaysA / workers[a].maxWorkDays || Infinity) - (availableDaysB / workers[b].maxWorkDays || Infinity);
        });
        
        let expertisesToBook = { ...mandatoryExpertises };
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