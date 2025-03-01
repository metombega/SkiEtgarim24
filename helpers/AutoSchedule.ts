type Worker = {
    maxWorkDays: number;
    expertises: string[];
};

type Schedule = {
    workers: string[];
    replaceableWorkers: string[];
    expertises: Record<string, number>;
};

const workers: Record<string, Worker> = {
    Alice: { maxWorkDays: 3, expertises: ["a", "b", "c"] },
    Bob: { maxWorkDays: 2, expertises: ["c", "b"] },
    Charlie: { maxWorkDays: 3, expertises: ["a", "b", "d"] },
    David: { maxWorkDays: 4, expertises: ["b", "c", "e"] },
    Eve: { maxWorkDays: 4, expertises: ["a", "b", "c", "d"] },
    Frank: { maxWorkDays: 1, expertises: ["a", "b", "c", "d"] },
    Grace: { maxWorkDays: 4, expertises: ["d", "b"] },
    Heidi: { maxWorkDays: 1, expertises: ["d"] },
    Ivan: { maxWorkDays: 2, expertises: ["a", "c"] },
};

let dateToWorkers: Record<string, string[]> = {
    "1/1/2025": ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
    "2/1/2025": ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
    "3/1/2025": ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
    "4/1/2025": ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
    "5/1/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "6/1/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
};

const mandatoryExpertises: Record<string, number> = { a: 1, b: 2, c: 1, d: 0, e: 1 };
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