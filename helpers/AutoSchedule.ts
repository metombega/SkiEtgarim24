const activityDates: string[] = ['1/1/2025', '2/1/2025', '3/1/2025', '4/1/2025', '5/1/2025', '6/1/2025'];
const workers: string[] = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan'];
const experties: string[] = ['a', 'b', 'c', 'd'];

// Define workers' expertise mapping
const workersExperties: Record<string, string[]> = {
    'Alice': ['a', 'b', 'c'], 
    'Bob': ['c', 'b'], 
    'Charlie': ['a', 'b', 'd'], 
    'David': ['b', 'c', 'e'], 
    'Eve': ['a', 'b', 'c', 'd'], 
    'Frank': ['a', 'b', 'c', 'd'], 
    'Grace': ['d', 'b'], 
    'Heidi': ['d'], 
    'Ivan': ['a', 'c']
};

// Define workers' availability mapping
const workersAvailability: Record<string, string[]> = {
    'Alice': ['1/1/2025', '2/1/2025', '3/1/2025', '4/1/2025', '5/1/2025'], 
    'Bob': ['5/1/2025', '6/1/2025'], 
    'Charlie': ['1/1/2025',  '3/1/2025', '4/1/2025', '5/1/2025', '6/1/2025'], 
    'David': ['1/1/2025', '2/1/2025', '3/1/2025', '5/1/2025', '6/1/2025'], 
    'Eve': ['1/1/2025', '2/1/2025',  '5/1/2025', '6/1/2025'], 
    'Frank': [ '2/1/2025', '3/1/2025', '4/1/2025', '5/1/2025', '6/1/2025'], 
    'Grace': ['1/1/2025', '2/1/2025', '3/1/2025', '4/1/2025', '5/1/2025', '6/1/2025'], 
    'Heidi': ['1/1/2025', '5/1/2025', '6/1/2025'], 
    'Ivan': ['1/1/2025', '2/1/2025', '3/1/2025', '4/1/2025']
};

// Define the maximum workdays for each worker
const workersMaxWorkDays: Record<string, number> = {
    'Alice': 3, 
    'Bob': 2, 
    'Charlie': 3, 
    'David': 4, 
    'Eve': 4, 
    'Frank': 1, 
    'Grace': 4, 
    'Heidi': 1, 
    'Ivan': 2
};

// Define the mandatory expertise required per day
const mandatoryExperties: Record<string, number> = {'a': 1, 'b': 2, 'c': 1, 'd': 0, 'e': 1};
const numOfWorkersPerDay = 5;

export function autoSchedule() {
    // Sort dates by the number of available workers
    const sortedActivityDates = [...activityDates].sort((a, b) => 
        workers.filter(worker => workersAvailability[worker].includes(a)).length -
        workers.filter(worker => workersAvailability[worker].includes(b)).length
    );

    const schedule: Record<string, any> = {};
    
    for (const date of sortedActivityDates) {
        schedule[date] = { workers: [], replaceableWorkers: [] };
        
        // Filter workers available on this date
        let availableWorkers = workers.filter(worker => workersAvailability[worker].includes(date));
        
        // Sort workers by their max work days divided by available days
        availableWorkers.sort((a, b) => 
            (workersAvailability[a].length / workersMaxWorkDays[a]) - 
            (workersAvailability[b].length / workersMaxWorkDays[b])
        );

        let expertiesToBook = { ...mandatoryExperties };
        let numOfWorkersBooked = numOfWorkersPerDay;

        // Assign workers to expertise
        for (const experty in expertiesToBook) {
            let workersWithExperty = availableWorkers.filter(worker => workersExperties[worker].includes(experty));
            
            while (expertiesToBook[experty] > 0 && workersWithExperty.length > 0) {
                const worker = workersWithExperty.shift()!;
                availableWorkers = availableWorkers.filter(w => w !== worker);
                workersMaxWorkDays[worker]--;
                
                for (const workerExperty of workersExperties[worker]) {
                    expertiesToBook[workerExperty]--;
                }
                
                numOfWorkersBooked--;
                schedule[date].workers.push(worker);
            }
        }

        // Assign remaining workers if necessary
        while (numOfWorkersBooked > 0) {
            const worker = availableWorkers.shift();
            if (!worker) break;
            workersMaxWorkDays[worker]--;
            schedule[date].workers.push(worker);
            numOfWorkersBooked--;
        }

        // Remove the date from workers' availability
        for (const worker of workers) {
            workersAvailability[worker] = workersAvailability[worker].filter(d => d !== date);
        }
    }
    console.log(schedule);
    return schedule;
}