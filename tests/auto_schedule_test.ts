import { autoScheduleWithSeparation } from "@/helpers/AutoSchedule";

let dateToWorkers: Record<string, string[]> = {
    // weekdays
    "5/4/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Grace", "Ivan"],
    "5/5/2025": ["Alice", "Bob", "David", "Eve", "Frank", "Grace", "Ivan"],
    "5/6/2025": ["Alice", "Bob", "Charlie", "David", "Frank", "Grace", "John"],
    "5/7/2025": ["Alice", "Bob", "Charlie", "Frank", "Grace", "David"],
    "5/8/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "5/11/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    // weekends
    "5/2/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Grace", "Ivan"],
    "5/3/2025": ["Alice", "Bob", "David", "Eve", "Frank", "Grace", "Ivan"],
    "5/9/2025": ["Alice", "Bob", "Charlie", "David", "Frank", "Grace", "John"],
    "5/10/2025": ["Alice", "Bob", "Charlie", "Frank", "Grace", "David"],
    "5/16/2025": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
    "5/17/2025": ["Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],

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

const mandatoryExpertises = {'a': 1, 'b': 2, 'c': 1, 'd': 0, 'e': 1};
(async () => {
    
    const schedule = await autoScheduleWithSeparation(workers, dateToWorkers, mandatoryExpertises, 5);
    console.log("Results:");
    for (const date in schedule) {
        console.log(`${date}: ${schedule[date].workers.join(',')}`);
        console.log(`Replaceable Workers: ${schedule[date].replaceableWorkers.join(',')}`);
        console.log('Roles:');
        for (const role in schedule[date].roles) {
            console.log(`${role}: ${schedule[date].roles[role].join(',')}`);
        }
    }
})();

// Output:
// 5/7/2025: Alice,Grace,David,Frank,Charlie
// 5/4/2025: Eve,Alice,Ivan,Grace,Bob
// 5/5/2025: Eve,Alice,Ivan,Grace,Frank
// 5/6/2025: Alice,Grace,John,Charlie,David
// 5/11/2025: Eve,Frank,David,Heidi,Grace
// 5/8/2025: Eve,Alice,Heidi,Charlie,David
// 5/10/2025: Alice,Grace,David,Frank,Charlie
// 5/2/2025: Eve,Alice,Ivan,Grace,Bob
// 5/3/2025: Eve,Alice,Ivan,Grace,Frank
// 5/9/2025: Alice,Grace,John,Charlie,David
// 5/17/2025: Eve,Frank,David,Heidi,Grace
// 5/16/2025: Eve,Alice,Heidi,Charlie,David
