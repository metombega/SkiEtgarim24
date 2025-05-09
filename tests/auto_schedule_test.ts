import { autoScheduleWithSeparation, analyzeScheduleWithSeparation } from "@/helpers/AutoSchedule";
const dateToWorkers = {
    "5/4/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Eve", "Grace", "Ivan"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
            { mandatory_experties: { a: 1, b: 0, c: 0, d: 0, e: 0 }, num_of_workers: 1 },
        ],
    },
    "5/5/2025": {
        available_workers: ["Alice", "Bob", "David", "Eve", "Frank", "Grace", "Ivan"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/6/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Frank", "Grace", "John"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/7/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "Frank", "Grace", "David"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/8/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/11/2025": {
        available_workers: ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    // weekends
    "5/2/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Eve", "Grace", "Ivan"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/3/2025": {
        available_workers: ["Alice", "Bob", "David", "Eve", "Frank", "Grace", "Ivan"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/9/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Frank", "Grace", "John"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/10/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "Frank", "Grace", "David"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/16/2025": {
        available_workers: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
    "5/17/2025": {
        available_workers: ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        boats: [
            { mandatory_experties: { a: 1, b: 2, c: 1, d: 0, e: 1 }, num_of_workers: 5 },
        ],
    },
};

const workers = {
    'Alice': { 'maxWeekdays': 5, 'maxWeekends': 5, 'expertises': ['a', 'b', 'c'] },
    'Bob': { 'maxWeekdays': 1, 'maxWeekends': 1, 'expertises': ['c', 'b'] },
    'Charlie': { 'maxWeekdays': 3, 'maxWeekends': 3, 'expertises': ['a', 'b', 'd'] },
    'David': { 'maxWeekdays': 4, 'maxWeekends': 4, 'expertises': ['b', 'c', 'e'] },
    'Eve': { 'maxWeekdays': 6, 'maxWeekends': 6, 'expertises': ['a', 'b', 'c', 'd'] },
    'Frank': { 'maxWeekdays': 4, 'maxWeekends': 4, 'expertises': ['a', 'b', 'c', 'd'] },
    'Grace': { 'maxWeekdays': 6, 'maxWeekends': 6, 'expertises': ['d', 'b'] },
    'Heidi': { 'maxWeekdays': 6, 'maxWeekends': 6, 'expertises': ['d'] },
    'Ivan': { 'maxWeekdays': 2, 'maxWeekends': 2, 'expertises': ['a', 'c', 'e'] },
    'John': { 'maxWeekdays': 1, 'maxWeekends': 1, 'expertises': ['e'] },
    'Karl': { 'maxWeekdays': 0, 'maxWeekends': 0, 'expertises': [] },
};

(async () => {
    const schedule = await autoScheduleWithSeparation(workers, dateToWorkers);
    console.log("Results:");
    for (const date in schedule) {
        for (const boat of schedule[date].boats) {
            console.log(`${date}: ${boat.workers.join(',')}`);
            // console.log(`Replaceable Workers: ${schedule[date].replaceableWorkers.join(',')}`);
        }
    }
    // const issues = await analyzeScheduleWithSeparation(schedule, workers, dateToWorkers);
    // for (const date in schedule) {
    //     for (const boat of schedule[date].boats) {
    //         console.log(`${date}: ${boat.workers.join(',')}`);
    //         console.log('Roles:');
    //         for (const role in boat.roles) {
    //             console.log(`${role}: ${boat.roles[role].join(',')}`);
    //         }
    //     }
    // }
    // console.log("Issues:", issues);
})();

// Output:
// 5/4/2025: Eve,Alice,Ivan,Grace,David
// 5/4/2025: Charlie
// 5/7/2025: Alice,Grace,David,Frank,Charlie
// 5/5/2025: Eve,Alice,Ivan,Grace,Frank
// 5/6/2025: Alice,Grace,John,Frank,Charlie
// 5/11/2025: Eve,Grace,David,Heidi,Bob
// 5/8/2025: Eve,Alice,Heidi,Frank,David
// 5/10/2025: Alice,Grace,David,Frank,Charlie
// 5/2/2025: Eve,Alice,Ivan,Grace,Bob
// 5/3/2025: Eve,Alice,Ivan,Grace,Frank
// 5/9/2025: Alice,Grace,John,Charlie,David
// 5/17/2025: Eve,Frank,David,Heidi,Grace
// 5/16/2025: Eve,Alice,Heidi,Charlie,David
