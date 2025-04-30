type Worker = {
    maxWeekdays: number;
    maxWeekends: number;
    expertises: string[];
};

type Schedule = {
    roles: Record<string, string[]>;
    workers: string[];
    replaceableWorkers: string[];
    expertises: Record<string, number>;
};

let workers: Record<string, Worker> = {};
let dateToWorkers: Record<string, string[]> = {};



export async function autoSchedule(
    workersOrigin: Record<string, Worker>,
    dateToWorkersOrigin: Record<string, string[]>,
    mandatoryExpertises: Record<string, number>,
    numOfWorkersPerDay: number,
    isWeekend: boolean = false
): Promise<Record<string, Schedule>> {

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
        let availableWorkers = [...dateToWorkers[date]].filter(worker => {
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
                    if (isWeekend) {
                        workers[worker].maxWeekends--;
                    } else {
                        workers[worker].maxWeekdays--;
                    }
                    for (const workerExpertise of workers[worker].expertises) {
                        expertisesToBook[workerExpertise]--;
                    }
                    numOfWorkersLeft--;
                    schedule[date].workers.push(worker);
                }
            }
        }

        // Book the rest of the workers
        const numOfWorkersLeftCopy = numOfWorkersLeft
        for (let i = 0; i < numOfWorkersLeftCopy; i++) {
            if (availableWorkers.length > 0) {
                const worker = availableWorkers.shift()!;
                if (isWeekend) {
                    workers[worker].maxWeekends--;
                } else {
                    workers[worker].maxWeekdays--;
                }
                
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

    return schedule;
}

export async function analyzeSchedule(
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker>,
    dateToWorkers: Record<string, string[]>,
    mandatoryExpertises: Record<string, number>,
    numOfWorkersPerDay: number,
    isWeekend: boolean = false
): Promise<string[]> {
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
        const maxWorkDays = isWeekend ? workers[workerId].maxWeekends : workers[workerId].maxWeekdays;
        const dayType = isWeekend ? "weekend" : "weekday";
        const scheduledDays = Object.keys(schedule).filter(date => schedule[date].workers.includes(workerId)).length;
        if (scheduledDays > maxWorkDays) {
            issues.push(
                `Worker ${workerId} has more ${dayType} (${scheduledDays}) than allowed (${maxWorkDays}).`
            );
        }
    }
    return issues;
}

export async function analyzeScheduleWithSeparation(
    schedule: Record<string, Schedule>,
    workers: Record<string, Worker>,
    dateToWorkers: Record<string, string[]>,
    mandatoryExpertises: Record<string, number>,
    numOfWorkersPerDay: number
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
        mandatoryExpertises,
        numOfWorkersPerDay,
        false // isWeekend = false
    );
    console.log(weekdayIssues);
    // Analyze weekend schedule
    const weekendIssues = await analyzeSchedule(
        weekendDates,
        workers,
        dateToWorkers,
        mandatoryExpertises,
        numOfWorkersPerDay,
        true // isWeekend = true
    );
    console.log(weekendIssues);

    // Combine the results
    const combinedIssues = [...weekdayIssues, ...weekendIssues];
    console.log(combinedIssues);

    return combinedIssues;
}

export async function autoScheduleWithSeparation(
    workersOrigin: Record<string, Worker>,
    dateToWorkersOrigin: Record<string, string[]>,
    mandatoryExpertises: Record<string, number>,
    numOfWorkersPerDay: number
): Promise<Record<string, Schedule>> {
    // Separate weekends and weekdays
    const weekendDates: Record<string, string[]> = {};
    const weekdayDates: Record<string, string[]> = {};

    for (const date in dateToWorkersOrigin) {
        const day = new Date(date).getDay();
        if (day === 5 || day === 6) {
            weekendDates[date] = dateToWorkersOrigin[date];
        } else {
            weekdayDates[date] = dateToWorkersOrigin[date];
        }
    }

    // Call autoSchedule for weekdays
    const weekdaySchedule = await autoSchedule(
        workersOrigin,
        weekdayDates,
        mandatoryExpertises,
        numOfWorkersPerDay,
        false // isWeekend = false
    );

    // Call autoSchedule for weekends
    const weekendSchedule = await autoSchedule(
        workersOrigin,
        weekendDates,
        mandatoryExpertises,
        numOfWorkersPerDay,
        true // isWeekend = true
    );

    // Combine the results
    const combinedSchedule: Record<string, Schedule> = { ...weekdaySchedule, ...weekendSchedule };

    return combinedSchedule;
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
    }
}