import { analyzeSchedule, analyzeScheduleWithSeparation, autoSchedule, autoScheduleWithSeparation} from "@/helpers/AutoSchedule";

let dateToWorkers: Record<string, string[]> = {
    // weekdays
    "5/4/2025": ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
    "5/5/2025": ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
    "5/6/2025": ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
    "5/7/2025": ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
    "5/8/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "5/11/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    // weekends
    "5/2/2025": ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
    "5/3/2025": ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
    "5/9/2025": ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
    "5/10/2025": ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
    "5/16/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "5/17/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
};

const workers = {
    'Alice': { 'maxWeekdays': 3, 'maxWeekends': 3, 'expertises': [ 'activity_manager', 'skipper'] },
    'Bob': { 'maxWeekdays': 2, 'maxWeekends': 2, 'expertises': ['skipper', 'activity_manager'] },
    'Charlie': { 'maxWeekdays': 3, 'maxWeekends': 3, 'expertises': [ 'activity_manager'] },
    'David': { 'maxWeekdays': 4, 'maxWeekends': 4, 'expertises': ['activity_manager', 'skipper'] },
    'Eve': { 'maxWeekdays': 4, 'maxWeekends': 4, 'expertises': [ 'activity_manager', 'skipper'] },
    'Frank': { 'maxWeekdays': 1, 'maxWeekends': 1, 'expertises': ['driver', 'activity_manager', 'skipper'] },
    'Grace': { 'maxWeekdays': 4, 'maxWeekends': 4, 'expertises': ['activity_manager'] },
    'Heidi': { 'maxWeekdays': 1, 'maxWeekends': 1, 'expertises': [] },
    'Ivan': { 'maxWeekdays': 2, 'maxWeekends': 2, 'expertises': ['driver', 'skipper'] }
};

(async () => {
    const schedule = await autoScheduleWithSeparation(workers, dateToWorkers, { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, 5);
    console.log("Results:");
    for (const date in schedule) {
        console.log(`${date}: ${schedule[date].workers.join(',')}`);
        console.log(`Replaceable Workers: ${schedule[date].replaceableWorkers.join(',')}`);
        console.log('Roles:');
        for (const role in schedule[date].roles) {
            console.log(`${role}: ${schedule[date].roles[role].join(',')}`);
        }
    }
    const issues = analyzeScheduleWithSeparation(schedule, workers, dateToWorkers, { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, 5);
    console.log("Results:");
    for (const date in schedule) {
        console.log(`${date}: ${schedule[date].workers.join(',')}`);
    }
    console.log("Schedule Issues:", issues);
})();

// expecting issues: [
//     'Date 5/4/2025 does not have the required expertise "driver".',
//     'Wrong number of workers on date 5/11/2025. Expected: 5, Got: 2.',
//     'Date 5/11/2025 does not have the required expertise "driver".',
//     'Wrong number of workers on date 5/8/2025. Expected: 5, Got: 2.',
//     'Date 5/8/2025 does not have the required expertise "driver".',
//     'Date 5/2/2025 does not have the required expertise "driver".',
//     'Wrong number of workers on date 5/17/2025. Expected: 5, Got: 2.',
//     'Date 5/17/2025 does not have the required expertise "driver".',
//     'Wrong number of workers on date 5/16/2025. Expected: 5, Got: 2.',
//     'Date 5/16/2025 does not have the required expertise "driver".'
// ]