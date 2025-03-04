import { autoSchedule } from "@/helpers/AutoSchedule";

let dateToWorkers: Record<string, string[]> = {
    "1/1/2025": ["Alice", "Charlie", "David", "Eve", "Grace", "Heidi", "Ivan"],
    "2/1/2025": ["Alice", "David", "Eve", "Frank", "Grace", "Ivan"],
    "3/1/2025": ["Alice", "Charlie", "David", "Frank", "Grace", "Ivan"],
    "4/1/2025": ["Alice", "Charlie", "Frank", "Grace", "Ivan", "David"],
    "5/1/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "6/1/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
};

const workers = {
    'Alice': { 'maxWorkDays': 3, 'expertises': ['driver', 'activity_manager', 'skipper'] },
    'Bob': { 'maxWorkDays': 2, 'expertises': ['skipper', 'activity_manager'] },
    'Charlie': { 'maxWorkDays': 3, 'expertises': ['driver', 'activity_manager'] },
    'David': { 'maxWorkDays': 4, 'expertises': ['activity_manager', 'skipper'] },
    'Eve': { 'maxWorkDays': 4, 'expertises': ['driver', 'activity_manager', 'skipper'] },
    'Frank': { 'maxWorkDays': 1, 'expertises': ['driver', 'activity_manager', 'skipper'] },
    'Grace': { 'maxWorkDays': 4, 'expertises': ['activity_manager'] },
    'Heidi': { 'maxWorkDays': 1, 'expertises': [] },
    'Ivan': { 'maxWorkDays': 2, 'expertises': ['driver', 'skipper'] }
};

(async () => {
    const schedule = autoSchedule(workers, dateToWorkers);
    console.log(schedule);
})();

// Output:
    // 2/1/2025: Eve,David,Grace,Alice,Ivan
    // 3/1/2025: Charlie,David,Alice,Grace,Ivan
    // 4/1/2025: Charlie,David,Alice,Grace,Frank
    // 1/1/2025: Eve,David,Charlie,Grace,Heidi
    // 6/1/2025: Bob,Eve,Charlie,David,Frank
    // 5/1/2025: Charlie,David,Frank,Bob,Eve