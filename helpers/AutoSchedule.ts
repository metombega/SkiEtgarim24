type Worker = {
    maxWeekdays: number;
    maxWeekends: number;
    expertises: string[];
};

// workers = {
//     'Alice': {'max_work_days': 2, 'experties': ['a', 'b', 'c']},
//     'Bob': {'max_work_days': 2, 'experties': ['a', 'b', 'c']},
//     'Charlie': {'max_work_days': 2, 'experties': ['a', 'b']},
// }

// dates = {
//     '1/1/2025': {'available_workers': ["Alice", "Bob", "Charlie"], 'boats': [{'mandatory_experties': {'a': 0, 'b': 0, 'c': 0}, 'num_of_workers': 0}, {'mandatory_experties': {'a': 1, 'b': 1, 'c': 1}, 'num_of_workers': 2}]},
//     '2/1/2025': {'available_workers': ["Alice", "Bob", "Charlie"], 'boats': [{'mandatory_experties': {'a': 1, 'b': 1, 'c': 1}, 'num_of_workers': 2}]},
//     '3/1/2025': {'available_workers': ["Alice", "Bob", "Charlie"], 'boats': [{'mandatory_experties': {'a': 0, 'b': 0, 'c': 2}, 'num_of_workers': 2}]},
// }
// schedule = {
    // '1/1/2025': 
        // {'boats': [
            // {'workers': [], 'remaining_workers': 0, 'remaining_experties': {'a': 0, 'b': 0, 'c': 0}}, 
            // {'workers': ['Bob', 'Charlie'], 'remaining_workers': 0, 'remaining_experties': {'a': -1, 'b': -1, 'c': 0}}
        // ], 
        // 'replaceableWorkers': ['Bob']}, 
    // '2/1/2025': {
        // 'boats': [{'workers': ['Charlie', 'Alice'], 'remaining_workers': 0, 'remaining_experties': {'a': -1, 'b': -1, 'c': 0}}], 
        // 'replaceableWorkers': ['Charlie']}, 
    // '3/1/2025': {
    // 'boats': [{'workers': ['Bob', 'Alice'], 'remaining_workers': 0, 'remaining_experties': {'a': -2, 'b': -2, 'c': 0}}], 
    // 'replaceableWorkers': []
    // }
// }
type Schedule = {
    boats: {
        workers: string[];
        remaining_workers: number;
        remaining_experties: Record<string, number>;
        roles: Record<string, string[]>;
    }[];
    replaceableWorkers: string[];
};

type DateToWorkers = Record<
    string,
    {
        available_workers: string[];
        boats: {
            mandatory_experties: Record<string, number>;
            num_of_workers: number;
        }[];
    }
>;

let workers: Record<string, Worker> = {};
let dateToWorkers: Record<string, string[]> = {};



export async function autoSchedule(
    workersOrigin: Record<string, Worker>,
    dateToWorkersOrigin: DateToWorkers,
    isWeekend: boolean = false
): Promise<Record<string, Schedule>> {

    dateToWorkers = Object.fromEntries(
        Object.entries(dateToWorkersOrigin).map(([date, info]) => [date, [...info.available_workers]])
    );

    workers = JSON.parse(JSON.stringify(workersOrigin));
    
    const schedule: Record<string, Schedule> = {};
    
    const sortedActivityDates = Object.keys(dateToWorkers)
        .sort((a, b) => {
            const aRatio = dateToWorkers[a].length / dateToWorkersOrigin[a].boats.reduce((sum, boat) => sum + boat.num_of_workers, 0);
            const bRatio = dateToWorkers[b].length / dateToWorkersOrigin[b].boats.reduce((sum, boat) => sum + boat.num_of_workers, 0);
            return aRatio - bRatio;
        });
    
    for (const date of sortedActivityDates) {
        schedule[date] = {
            boats: dateToWorkersOrigin[date].boats.map(boat => ({
                workers: [],
                remaining_workers: boat.num_of_workers,
                remaining_experties: { ...boat.mandatory_experties },
                roles: {}
            })),
            replaceableWorkers: []
        };
        let availableWorkers = Array.from(dateToWorkers[date] ?? []).filter(worker => {
            const maxDays = isWeekend ? workers[worker].maxWeekends : workers[worker].maxWeekdays;
            return maxDays > 0;
        });
        
        availableWorkers.sort((a, b) => a.localeCompare(b))
            .sort((a, b) => {
                const availableDaysA = Object.keys(dateToWorkers).filter(d => dateToWorkers[d].includes(a)).length;
                const availableDaysB = Object.keys(dateToWorkers).filter(d => dateToWorkers[d].includes(b)).length;
                return (availableDaysA / (isWeekend ? workers[a].maxWeekends : workers[a].maxWeekdays) || Infinity) - 
                       (availableDaysB / (isWeekend ? workers[b].maxWeekends : workers[b].maxWeekdays) || Infinity);
            });
        
        for (const boat of dateToWorkersOrigin[date].boats) {
            const boatIndex = dateToWorkersOrigin[date].boats.indexOf(boat);
            for (const expertise in schedule[date]['boats'][boatIndex].remaining_experties) {
                let workersWithExpertise = availableWorkers.filter(worker => workers[worker].expertises.includes(expertise));
                for (const worker of workersWithExpertise) {
                    if (schedule[date]['boats'][boatIndex].remaining_experties[expertise] > 0) {
                        availableWorkers = availableWorkers.filter(w => w !== worker);
                        if (isWeekend) {
                            workers[worker].maxWeekends--;
                        } else {
                            workers[worker].maxWeekdays--;
                        }
                        for (const workerExpertise of workers[worker].expertises) {
                            schedule[date]['boats'][boatIndex].remaining_experties[workerExpertise]--;
                        }
                        boat.num_of_workers--;
                        schedule[date]['boats'][boatIndex]['workers'].push(worker);
                    }
                }
            }
        }

        for (const boat of dateToWorkersOrigin[date].boats) {
            // Book the rest of the workers
            const workersLeft: number = boat.num_of_workers;
            for (let i = 0; i < workersLeft; i++) {
                if (availableWorkers.length > 0) {
                    const worker = availableWorkers.shift()!;
                    if (isWeekend) {
                        workers[worker].maxWeekends--;
                    } else {
                        workers[worker].maxWeekdays--;
                    }
                    
                    for (const workerExpertise of workers[worker].expertises) {
                        schedule[date]['boats'][dateToWorkersOrigin[date].boats.indexOf(boat)].remaining_experties[workerExpertise]--;
                    }
                    // const boatIndex = dateToWorkersOrigin[date].boats.indexOf(boat);
                    schedule[date]['boats'][dateToWorkersOrigin[date].boats.indexOf(boat)]['workers'].push(worker);
                    boat.num_of_workers--;
                }
            }
        }
        delete dateToWorkers[date];
        for (const boat of schedule[date].boats) {
            for (const worker of boat.workers) {
                let isReplaceable = true;
                for (const workerExpertise of workers[worker].expertises) {
                    if (boat.remaining_experties[workerExpertise] >= 0) {
                    isReplaceable = false;
                    break;
                    }
                }
                if (isReplaceable) {
                    schedule[date].replaceableWorkers.push(worker);

                }
            }
        }
    }

    // Check if there are workers that can be replaced to complete the missing expertises
    for (const date in schedule) {
        for (const boat of schedule[date].boats) {
            const boatIndex = schedule[date].boats.indexOf(boat);
            for (const expertise in boat.remaining_experties) {
                if (boat.remaining_experties[expertise] > 0) {
                    let replaced = false;
                    const workersWithExpertise = Object.keys(workers).filter(
                        worker =>
                            workers[worker].expertises.includes(expertise) &&
                            dateToWorkersOrigin[date]?.available_workers.includes(worker) &&
                            !boat.workers.includes(worker)
                    );
                    for (const worker of workersWithExpertise) {
                        if (!replaced) {
                            let scheduleDates: Record<string, number> = {};
                            for (const dateX in schedule) {
                                for (let boatIndex = 0; boatIndex < schedule[dateX].boats.length; boatIndex++) {
                                    const boatX = schedule[dateX].boats[boatIndex];
                                    if (boatX.workers.includes(worker)) {
                                        scheduleDates[dateX] = boatIndex;
                                    }
                                }
                            }
                            // Keep only the dates where the worker is in replaceableWorkers
                            const filteredScheduleDates = Object.fromEntries(
                                Object.entries(scheduleDates).filter(([dateX]) =>
                                    schedule[dateX].replaceableWorkers.includes(worker)
                                )
                            );

                            for (const scheduledDate in filteredScheduleDates) {
                                // Workers to replace Should be replaceable on the date we are looking at, Should not already be in the scheduledDate we are replacing, but should be available on this date.
                                const workersToReplace = schedule[date].replaceableWorkers.filter(
                                    workerX =>
                                        schedule[scheduledDate].boats.every(boat => !boat.workers.includes(workerX)) &&
                                        dateToWorkersOrigin[scheduledDate]?.available_workers.includes(workerX)
                                );

                                if (workersToReplace.length > 0) {
                                    replaceWorkers(
                                        worker,
                                        scheduledDate,
                                        filteredScheduleDates[scheduledDate],
                                        workersToReplace[0],
                                        date,
                                        boatIndex,
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
    }

    // add roles
    const mandatoryExpertises: Record<string, number> = {}; // Define mandatoryExpertises or pass it as a parameter

    for (const date in schedule) {
        let expertisesToBook: Record<string, number> = Object.keys(mandatoryExpertises).reduce((acc, key) => {
            acc[key] = mandatoryExpertises[key];
            return acc;
        }, {} as Record<string, number>);
        
        for (const boat of schedule[date].boats) {
            for (const worker of boat.workers) {
                for (const workerExpertise of workers[worker].expertises) {
                    expertisesToBook[workerExpertise]--;
                    if (!boat.roles[worker]) {
                        boat.roles[worker] = [];
                    }
                    if (expertisesToBook[workerExpertise] >= 0) {
                        boat.roles[worker].push(workerExpertise);
                    }
                }
            }
        }
    }
    return schedule;
}

export async function analyzeSchedule(
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker>,
    dateToWorkers: DateToWorkers,
    isWeekend: boolean = false
): Promise<string[]> {
    const issues: string[] = [];
    for (const date in schedule) {
        for (const boat of schedule[date].boats) {
            const scheduledWorkers = boat.workers;
            const boatIndex = schedule[date].boats.indexOf(boat);

            // Check if the number of workers is correct
            if (scheduledWorkers.length !== boat.remaining_workers) {
                issues.push(
                    // `Wrong number of workers on date ${date} and boat ${boatIndex + 1}. Expected: ${boat.remaining_workers}, Got: ${scheduledWorkers.length}.`
                    `כמות עובדים שגויה בתאריך ${date} וסירה ${boatIndex + 1}. צפוי: ${boat.remaining_workers}, בפועל: ${scheduledWorkers.length}.`
                );
            }

            // Check if the workers are in the dateToWorkers
            for (const worker of scheduledWorkers) {
                if (!dateToWorkers[date]?.available_workers.includes(worker)) {
                    issues.push(
                        // `Worker ${worker} was not signed up for date ${date} and boat ${boatIndex + 1}.`
                        `העובד ${worker} לא נרשם לתאריך ${date} וסירה ${boatIndex + 1}.`
                    );
                }
            }

            // Check if the workers have the required expertises
            const boatMandatoryExpertises = dateToWorkers[date].boats[boatIndex].mandatory_experties;
            const mandatoryExpertisesCopy = { ...boatMandatoryExpertises };
            for (const worker of scheduledWorkers) {
                for (const experty of workers[worker].expertises) {
                    if (mandatoryExpertisesCopy[experty] !== undefined) {
                        mandatoryExpertisesCopy[experty]--;
                    }
                }
            }
            for (const experty in mandatoryExpertisesCopy) {
                if (mandatoryExpertisesCopy[experty] > 0) {
                    issues.push(
                        // `Date ${date} and boat ${boatIndex + 1} does not have the required expertise "${experty}". expected: ${boatMandatoryExpertises[experty]}, got: ${boatMandatoryExpertises[experty] - mandatoryExpertisesCopy[experty]}.`
                        `בתאריך ${date} וסירה ${boatIndex + 1} אין את המומחיות הנדרשת "${experty}". צפוי: ${boatMandatoryExpertises[experty]}, בפועל: ${boatMandatoryExpertises[experty] - mandatoryExpertisesCopy[experty]}.`
                    );
                }
            }
        }
    }

    // Check if the workers have more workdays than allowed
    for (const workerId in workers) {
        const maxWorkDays = isWeekend ? workers[workerId].maxWeekends : workers[workerId].maxWeekdays;
        const dayType = isWeekend ? "weekend" : "weekday";
        const scheduledDays = Object.keys(schedule).reduce((count, date) => {
            return count + schedule[date].boats.filter(boat => boat.workers.includes(workerId)).length;
        }, 0);
        if (scheduledDays > maxWorkDays) {
            issues.push(
                // `Worker ${workerId} has more ${dayType} (${scheduledDays}) than allowed (${maxWorkDays}).`
                `לעובד ${workerId} יש יותר ${dayType === "weekend" ? "סופי שבוע" : "ימי חול"} (${scheduledDays}) ממה שנרשם (${maxWorkDays}).`
            );
        }
    }

    // find roles
    findRoles(schedule, workers, dateToWorkers);

    return issues;
}

export async function analyzeScheduleWithSeparation(
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker>,
    dateToWorkers: DateToWorkers,
): Promise<string[]> {
    // Separate weekends and weekdays
    const weekendDates: Record<string, Schedule> = {};
    const weekdayDates: Record<string, Schedule> = {};

    for (const date in schedule) {
        const day = new Date(date).getDay();
        if (day === 5 || day === 6) { // 0 = Sunday, 6 = Saturday
            weekendDates[date] = schedule[date];
        } else {
            weekdayDates[date] = schedule[date];
        }
    }

    // Analyze weekday schedule
    const weekdayIssues = await analyzeSchedule(
        weekdayDates,
        workers,
        dateToWorkers,
        false // isWeekend = false
    );
    // Analyze weekend schedule
    const weekendIssues = await analyzeSchedule(
        weekendDates,
        workers,
        dateToWorkers,
        true // isWeekend = true
    );
    // Combine the results
    const combinedIssues = [...weekdayIssues, ...weekendIssues];

    return combinedIssues;
}

export async function autoScheduleWithSeparation(
    workersOrigin: Record<string, Worker>,
    dateToWorkersOrigin: DateToWorkers,
): Promise<Record<string, Schedule>> {
    // Separate weekends and weekdays
    const weekendDates: DateToWorkers = {};
    const weekdayDates: DateToWorkers = {};

    for (const date in dateToWorkersOrigin) {
        const day = new Date(date).getDay();
        if (day === 5 || day === 6) {
            weekendDates[date] = {
                available_workers: dateToWorkersOrigin[date].available_workers, // Adjust type if necessary
                boats: dateToWorkersOrigin[date].boats
            };
        } else {
            weekdayDates[date] = {
                available_workers: dateToWorkersOrigin[date].available_workers, // Adjust type if necessary
                boats: dateToWorkersOrigin[date].boats
            };
        }
    }

    // Call autoSchedule for weekdays
    const weekdaySchedule = await autoSchedule(
        workersOrigin,
        weekdayDates,
        false // isWeekend = false
    );

    // Call autoSchedule for weekends
    const weekendSchedule = await autoSchedule(
        workersOrigin,
        weekendDates,
        true // isWeekend = true
    );

    // Combine the results
    const combinedSchedule: Record<string, Schedule> = { ...weekdaySchedule, ...weekendSchedule };

    return combinedSchedule;
}

export function replaceWorkers(
    worker1: string,
    date1: string,
    boat1_index: number,
    worker2: string,
    date2: string,
    boat2_index: number,
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker>
): void {
    console.log(`Replacing ${worker1} on ${date1} and index ${boat1_index} with ${worker2} on ${date2} and index ${boat2_index}`);
    if (
        !schedule[date2].boats[boat2_index].workers.includes(worker1) &&
        !schedule[date1].boats[boat2_index].workers.includes(worker2) &&
        schedule[date1].replaceableWorkers.includes(worker1) &&
        schedule[date2].replaceableWorkers.includes(worker2) &&
        schedule[date1].boats[boat2_index].workers.includes(worker1) &&
        schedule[date2].boats[boat2_index].workers.includes(worker2)
    ) {
        // Swap workers between dates
        schedule[date1].boats[boat2_index].workers = schedule[date1].boats[boat2_index].workers.filter(w => w !== worker1);
        schedule[date1].boats[boat2_index].workers.push(worker2);
        schedule[date2].boats[boat2_index].workers = schedule[date2].boats[boat2_index].workers.filter(w => w !== worker2);
        schedule[date2].boats[boat2_index].workers.push(worker1);

        // Update replaceable workers
        schedule[date1].replaceableWorkers = schedule[date1].replaceableWorkers.filter(w => w !== worker1);
        schedule[date2].replaceableWorkers = schedule[date2].replaceableWorkers.filter(w => w !== worker2);

        // Update expertises for date1
        for (const expertise in schedule[date1].boats[boat1_index].remaining_experties) {
            if (workers[worker1].expertises.includes(expertise)) {
                schedule[date1].boats[boat1_index].remaining_experties[expertise]++;
            }
            if (workers[worker2].expertises.includes(expertise)) {
                schedule[date1].boats[boat1_index].remaining_experties[expertise]--;
            }
        }

        // Update expertises for date2
        for (const expertise in schedule[date2].boats[boat2_index].remaining_experties) {
            if (workers[worker2].expertises.includes(expertise)) {
                schedule[date2].boats[boat2_index].remaining_experties[expertise]++;
            }
            if (workers[worker1].expertises.includes(expertise)) {
                schedule[date2].boats[boat2_index].remaining_experties[expertise]--;
            }
        }
    }
}

export function findRoles(
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker>,
    dateToWorkers: DateToWorkers,
): void {
      for (const date in schedule) {
        for (const boat of schedule[date].boats) {
            const boatIndex = schedule[date].boats.indexOf(boat);
            const boatMandatoryExpertises = dateToWorkers[date].boats[boatIndex].mandatory_experties;
            const mandatoryExpertisesCopy = { ...boatMandatoryExpertises };
            boat.roles = {}; // Initialize roles for the boat
            const num_of_workers = boat.workers.length;
            let worker_index = 0;
            for (const experty in mandatoryExpertisesCopy) {
                console.log(`experties: ${experty}, num_of_workers: ${num_of_workers}, worker_index: ${worker_index}`);
                for (let i = 0; i < num_of_workers; i++) {
                    console.log(`remaining_experties ${experty}: ${mandatoryExpertisesCopy[experty]}`);
                    if (mandatoryExpertisesCopy[experty] == 0) {
                       break;
                    }
                    console.log(`worker: ${boat.workers[worker_index]}`);
                    console.log(`worker expertises: ${workers[boat.workers[worker_index]].expertises}`);
                    console.log(`has experty: ${workers[boat.workers[worker_index]].expertises.includes(experty)}`);
                    if (workers[boat.workers[worker_index]].expertises.includes(experty)) {
                        if (!boat.roles[boat.workers[worker_index]]) {
                            boat.roles[boat.workers[worker_index]] = [];
                        }
                        boat.roles[boat.workers[worker_index]].push(experty);
                        mandatoryExpertisesCopy[experty]--;
                        console.log(`Assigned ${experty} to ${boat.workers[worker_index]}`);
                    }
                    worker_index++;
                    worker_index = worker_index % num_of_workers;
                    console.log(`worker_index: ${worker_index}`);
                    console.log(`mandatoryExpertisesCopy: ${JSON.stringify(mandatoryExpertisesCopy)}`);
                }
            }
            // for (const worker of boat.workers) {
            //     for (const workerExpertise of workers[worker].expertises) {
            //         mandatoryExpertisesCopy[workerExpertise]--;
            //         if (!boat.roles[worker]) {
            //             boat.roles[worker] = [];
            //         }
            //         if (mandatoryExpertisesCopy[workerExpertise] >= 0) {
            //             boat.roles[worker].push(workerExpertise);
            //         }
            //     }
            // }
        }
    }
}