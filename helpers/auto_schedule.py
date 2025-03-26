from copy import deepcopy

def schedule_workers(workers, date_to_workers, mandatory_experties, num_of_workers_per_day):
    """ 
    sort the dates by the number of workers that can work on this date - we want to take first the dates with the least workers
    sort the workers by the max number of days they can work devide by the number of their available days
    """
    date_to_workers_copy = deepcopy(date_to_workers)
    workers_copy = deepcopy(workers)
    schedule = {}
    # sort the dates by the number of workers that can work on this date
    sorted_activity_dates = sorted(date_to_workers_copy.keys(), key=lambda date: len(date_to_workers_copy[date]))
    for date in sorted_activity_dates:
        schedule[date] = {'workers': [], 'replacble_workers': []}
        # filter the workers that can work in this date
        available_workers = [worker for worker in date_to_workers_copy[date] if workers_copy[worker]['max_work_days'] > 0]
        # sort workers by the max work days devided by the number of days they can work. pay attention to devided by zero
        available_workers_sorted = sorted(available_workers, key=lambda worker: len([date for date in date_to_workers_copy if worker in date_to_workers_copy[date]]) / workers_copy[worker]['max_work_days'])
        # for each experty in mandatory_experties, book the first worker that has this experty
        experties_to_book = deepcopy(mandatory_experties)
        num_of_workers_left = num_of_workers_per_day
        for experty in experties_to_book:
            workers_with_experty = [worker for worker in available_workers_sorted if experty in workers_copy[worker]['experties']]
            for worker in workers_with_experty:
                if experties_to_book[experty] > 0:
                    add_worker_to_schedule(worker, available_workers_sorted, workers_copy, experties_to_book, schedule, date)
                    workers_with_experty.remove(worker)
                    num_of_workers_left -= 1
            if experties_to_book[experty] > 0: 
                print(f'no more workers with experty {experty} on date {date}')
        # book the rest of the workers
        for _ in range(num_of_workers_left):
            if available_workers_sorted:
                add_worker_to_schedule(available_workers_sorted[0], available_workers_sorted, workers_copy, experties_to_book, schedule, date)
                num_of_workers_left -= 1

        # remove the date from the availability
        date_to_workers_copy.pop(date)
        
        # find all the workers that could be replaced
        for worker in schedule[date]['workers']:
            is_replacable = True
            for worker_experty in workers_copy[worker]['experties']:
                # check if all the worker's experties are booked and have en extra worker with this experty
                if experties_to_book[worker_experty] >= 0:
                    is_replacable = False
                    break
            if is_replacable:
                schedule[date]['replacble_workers'].append(worker)
        schedule[date]['experties'] = experties_to_book

        # check if there are workers that can be replaced to complete the missing experties
        for date in schedule:
            for experty in schedule[date]['experties']:
                if schedule[date]['experties'][experty] > 0:
                    replaced = False
                    workers_with_experty = [worker for worker in workers if experty in workers[worker]['experties'] and worker in date_to_workers[date] and worker not in schedule[date]['workers']]
                    for worker in workers_with_experty:
                        if not replaced:
                            for scheduled_date in [date_x for date_x in schedule if worker in schedule[date_x]['workers']]:
                                workers_to_replace = [worker for worker in schedule[date]['replacble_workers'] if worker not in schedule[scheduled_date]['workers'] and worker in date_to_workers[scheduled_date]]
                                if worker in schedule[scheduled_date]['replacble_workers'] and workers_to_replace != []:
                                    replace_workers(worker, scheduled_date, workers_to_replace[0], date, schedule)
                                    replaced = True
                                    break
    for date in schedule:
        print(f"{date}: {schedule[date]['workers']}")
    return schedule

def check_schedule(schedule, workers, date_to_workers, mandatory_experties, num_of_workers_per_day):
    """ check if the schedule is valid """
    issues = []
    
    for date in schedule:
        # check if the number of workers is correct
        if len(schedule[date]['workers']) != num_of_workers_per_day:
            issues.append(f'wrong number of workers on date {date}. expected {num_of_workers_per_day}, got {len(schedule[date]["workers"])}')
        # check if the workers are in the date_to_workers
        for worker in schedule[date]['workers']:
            if worker not in date_to_workers[date]:
                issues.append(f'worker {worker} was not signed to date {date}')
        # check if the workers have the required experties
        mandatory_experties_copy = deepcopy(mandatory_experties)
        for worker in schedule[date]['workers']:
            for experty in workers[worker]['experties']:
                mandatory_experties_copy[experty] -= 1
        for experty in mandatory_experties_copy:
            if mandatory_experties_copy[experty] > 0:
                issues.append(f'date {date} does not have the required experty {experty}')
    # check if the workers have more work days than allowed
    for worker in workers:
        if workers[worker]['max_work_days'] < len([date for date in schedule if worker in schedule[date]['workers']]):
            issues.append(f'worker {worker} has more work days than allowed')
    return issues

def replace_workers(worker1, date1, worker2, date2, schedule):
    """ replace worker1 with worker2 in the schedule """
    if worker1 not in schedule[date2]['workers'] and worker2 not in schedule[date1]['workers'] and worker1 in schedule[date1]['replacble_workers'] and worker2 in schedule[date2]['replacble_workers'] and worker1 in schedule[date1]['workers'] and worker2 in schedule[date2]['workers']:
        schedule[date1]['workers'].remove(worker1)
        schedule[date1]['workers'].append(worker2)
        schedule[date2]['workers'].remove(worker2)
        schedule[date2]['workers'].append(worker1)
        schedule[date1]['replacble_workers'].remove(worker1)
        schedule[date2]['replacble_workers'].remove(worker2)
        # update the experties
        for experty in schedule[date1]['experties']:
            if experty in workers[worker1]['experties']:
                schedule[date1]['experties'][experty] += 1
            if experty in workers[worker2]['experties']:
                schedule[date1]['experties'][experty] -= 1
        for experty in schedule[date2]['experties']:
            if experty in workers[worker2]['experties']:
                schedule[date2]['experties'][experty] += 1
            if experty in workers[worker1]['experties']:
                schedule[date2]['experties'][experty] -= 1
    else:
        print(f'A replacement of {worker1} with {worker2} in {date1} and {date2} is not possible')
        
def add_worker_to_schedule(worker, available_workers_sorted, workers_copy, experties_to_book, schedule, date):
    available_workers_sorted.remove(worker)
    workers_copy[worker]['max_work_days'] -= 1
    # remove all the required experties on this date
    for worker_experty in workers_copy[worker]['experties']:
        experties_to_book[worker_experty] -= 1
    schedule[date]['workers'].append(worker)

if __name__ == '__main__':
    workers = {
        'Alice': {'max_work_days': 5, 'experties': ['a', 'b', 'c']},
        'Bob': {'max_work_days': 1, 'experties': ['c', 'b']},
        'Charlie': {'max_work_days': 3, 'experties': ['a', 'b', 'd']},
        'David': {'max_work_days': 4, 'experties': ['b', 'c', 'e']},
        'Eve': {'max_work_days': 6, 'experties': ['a', 'b', 'c', 'd']},
        'Frank': {'max_work_days': 4, 'experties': ['a', 'b', 'c', 'd']},
        'Grace': {'max_work_days': 6, 'experties': ['d', 'b']},
        'Heidi': {'max_work_days': 6, 'experties': ['d']},
        'Ivan': {'max_work_days': 2, 'experties': ['a', 'c', 'e']},
        'John': {'max_work_days': 1, 'experties': ['e']},
        'Karl': {'max_work_days': 1, 'experties': []}
    }
    date_to_workers = {
        '1/1/2025': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Grace', 'Ivan'],
        '2/1/2025': ['Alice', 'Bob', 'David', 'Eve', 'Frank', 'Grace', 'Ivan'],
        '3/1/2025': ['Alice', 'Bob', 'Charlie', 'David', 'Frank', 'Grace', 'John'],
        '4/1/2025': ['Alice', 'Bob', 'Charlie', 'Frank', 'Grace', 'David', 'Karl'],
        '5/1/2025': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi'],
        '6/1/2025': ['Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi']
    }

    mandatory_experties = {'a': 1, 'b': 2, 'c': 1, 'd': 0, 'e': 1}
    num_of_workers_per_day = 5
    schedule = schedule_workers(workers, date_to_workers, mandatory_experties, num_of_workers_per_day)
    print(check_schedule(schedule, workers, date_to_workers, mandatory_experties, num_of_workers_per_day))

    
# option for changes!

# dates are constant
# every worker write all dates that they can
# then writes for every month how many weekends workdays, and week workdays they want.
# they do it every month/two
# better to put people that will have all experties

# אחראי פעילות, נהג, 3 אנשי צוות
# 2 רשיון משיט
# 5 poeople 

# now the surfers are signing (maybe with another person/surfer)
# 4 surfers a day/ course
# if there is a problem with the experties, we will switch the workers

# first schedule the workers that have special experties
# second schedule the workers that has less days to work

# 1/1/2025
# : 
# replaceableWorkers
# : 
# []
# workers
# : 
# (5) ['Eve', 'David', 'Charlie', 'Grace', 'Heidi']
# [[Prototype]]
# : 
# Object

# 2/1/2025: ['Alice', 'David', 'Eve', 'Grace', 'Frank']
# 3/1/2025: ['Alice', 'Charlie', 'David', 'Grace', 'Frank']
# 4/1/2025: ['Alice', 'Charlie', 'David', 'Grace', 'Frank']
# 1/1/2025: ['Charlie', 'David', 'Eve', 'Heidi', 'Alice']
# 6/1/2025: ['Eve', 'Bob', 'David', 'Grace', 'Frank']
# 5/1/2025: ['Eve', 'Bob', 'David', 'Alice', 'Frank']
