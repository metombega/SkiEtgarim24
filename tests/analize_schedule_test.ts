import { analyzeSchedule, autoSchedule} from "@/helpers/AutoSchedule";

let dateToWorkers: Record<string, string[]> = {
    "1/1/2025": ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
    "2/1/2025": ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
    "3/1/2025": ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
    "4/1/2025": ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
    "5/1/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "6/1/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
};

const workers = {
    'Alice': { 'maxWorkDays': 3, 'expertises': [ 'activity_manager', 'skipper'] },
    'Bob': { 'maxWorkDays': 2, 'expertises': ['skipper', 'activity_manager'] },
    'Charlie': { 'maxWorkDays': 3, 'expertises': [ 'activity_manager'] },
    'David': { 'maxWorkDays': 4, 'expertises': ['activity_manager', 'skipper'] },
    'Eve': { 'maxWorkDays': 4, 'expertises': [ 'activity_manager', 'skipper'] },
    'Frank': { 'maxWorkDays': 1, 'expertises': ['driver', 'activity_manager', 'skipper'] },
    'Grace': { 'maxWorkDays': 4, 'expertises': ['activity_manager'] },
    'Heidi': { 'maxWorkDays': 1, 'expertises': [] },
    'Ivan': { 'maxWorkDays': 2, 'expertises': ['driver', 'skipper'] }
};

(async () => {
    const schedule = await autoSchedule(workers, dateToWorkers);
    const issues = analyzeSchedule(workers, dateToWorkers, schedule);
    console.log("Results:");
    for (const date in schedule) {
        console.log(`${date}: ${schedule[date].workers.join(',')}`);
    }
    console.log("Schedule Issues:", issues);
})();

// expecting issues: [
//     'Date 1/1/2025 does not have the required expertise "driver".',
//     'Wrong number of workers on date 6/1/2025. Expected: 5, Got: 2.',
//     'Date 6/1/2025 does not have the required expertise "driver".',
//     'Wrong number of workers on date 5/1/2025. Expected: 5, Got: 2.',
//     'Date 5/1/2025 does not have the required expertise "driver".'
//   ]