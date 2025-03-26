import { autoSchedule } from "@/helpers/AutoSchedule";

let dateToWorkers: Record<string, string[]> = {
    "1/1/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Grace", "Ivan"],
    "2/1/2025": ["Alice", "Bob", "David", "Eve", "Frank", "Grace", "Ivan"],
    "3/1/2025": ["Alice", "Bob", "Charlie", "David", "Frank", "Grace", "John"],
    "4/1/2025": ["Alice", "Bob", "Charlie", "Frank", "Grace", "David"],
    "5/1/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "6/1/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
};

const workers = {
    'Alice': { 'maxWorkDays': 5, 'expertises': ['a', 'b', 'c'] },
    'Bob': { 'maxWorkDays': 1, 'expertises': ['c', 'b'] },
    'Charlie': { 'maxWorkDays': 3, 'expertises': ['a', 'b', 'd'] },
    'David': { 'maxWorkDays': 4, 'expertises': ['b', 'c', 'e'] },
    'Eve': { 'maxWorkDays': 6, 'expertises': ['a', 'b', 'c', 'd'] },
    'Frank': { 'maxWorkDays': 4, 'expertises': ['a', 'b', 'c', 'd'] },
    'Grace': { 'maxWorkDays': 6, 'expertises': ['d', 'b'] },
    'Heidi': { 'maxWorkDays': 6, 'expertises': ['d'] },
    'Ivan': { 'maxWorkDays': 2, 'expertises': ['a', 'c', 'e'] },
    'John': { 'maxWorkDays': 1, 'expertises': ['e'] },
    'Karl': { 'maxWorkDays': 0, 'expertises': [] },
};

const mandatoryExpertises = {'a': 1, 'b': 2, 'c': 1, 'd': 0, 'e': 1};
(async () => {
    const schedule = await autoSchedule(workers, dateToWorkers, mandatoryExpertises);
    console.log("Results:");
    for (const date in schedule) {
        console.log(`${date}:`);
        console.log(`Workers: ${schedule[date].workers.join(',')}`);
        console.log(`Replaceable Workers: ${schedule[date].replaceableWorkers.join(',')}`);
        console.log('Roles:');
        for (const role in schedule[date].roles) {
            console.log(`${role}: ${schedule[date].roles[role].join(',')}`);
        }
    }
})();

// Output:
// 4/1/2025: Alice,Grace,David,Frank,Charlie
// 1/1/2025: Eve,Alice,Ivan,Grace,Bob
// 2/1/2025: Eve,Alice,Ivan,Grace,Frank
// 3/1/2025: Alice,Grace,John,Charlie,David
// 6/1/2025: Eve,Frank,David,Heidi,Grace
// 5/1/2025: Eve,Alice,Heidi,Charlie,David