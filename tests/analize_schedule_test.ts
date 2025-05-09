import { analyzeSchedule, analyzeScheduleWithSeparation, autoSchedule, autoScheduleWithSeparation} from "@/helpers/AutoSchedule";

const dateToWorkers = {
    "5/4/2025": {
        available_workers: ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/5/2025": {
        available_workers: ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/6/2025": {
        available_workers: ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/7/2025": {
        available_workers: ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/8/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/11/2025": {
        available_workers: ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    // weekends
    "5/2/2025": {
        available_workers: ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/3/2025": {
        available_workers: ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/9/2025": {
        available_workers: ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/10/2025": {
        available_workers: ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/16/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
    "5/17/2025": {
        available_workers: ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [{ mandatory_experties: { 'driver': 1, 'activity_manager': 1, 'skipper': 2 }, num_of_workers: 5 }],
    },
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
    const schedule = await autoScheduleWithSeparation(workers, dateToWorkers);
    console.log("Results:");
    for (const date in schedule) {
        for (const boat of schedule[date].boats) {
            console.log(`${date}: ${boat.workers.join(',')}`);
            console.log(`Replaceable Workers: ${schedule[date].replaceableWorkers.join(',')}`);
        }
    }
    const issues = await analyzeScheduleWithSeparation(schedule, workers, dateToWorkers);
    console.log("Results:");
    for (const date in schedule) {
        for (const boat of schedule[date].boats) {
            console.log(`${date}: ${boat.workers.join(',')}`);
            console.log('Roles:');
            for (const role in boat.roles) {
                console.log(`${role}: ${boat.roles[role].join(',')}`);
            }
        }
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