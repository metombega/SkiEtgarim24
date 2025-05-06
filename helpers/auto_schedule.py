from copy import deepcopy

def schedule_workers(workers, dates):
    """ 
    Schedule workers based on their availability and expertise.
    """
    dates_copy = deepcopy(dates)
    workers_copy = deepcopy(workers)
    schedule = {}

    # Sort the dates by the number of available workers
    sorted_activity_dates = sorted(
        dates_copy.keys(),
        key=lambda date: len(dates_copy[date]['available_workers']) / sum(boat['num_of_workers'] for boat in dates_copy[date]['boats'])
    )
    for date in sorted_activity_dates:
        schedule[date] = {'boats': [], 'replaceable_workers': []}
        available_workers = [worker for worker in dates_copy[date]['available_workers'] if workers_copy[worker]['max_work_days'] > 0]
        # Sort workers by the max work days divided by the number of days they can work
        available_workers_sorted = sorted(
            available_workers,
            key=lambda worker: len([d for d in dates_copy if worker in dates_copy[d]['available_workers']]) / workers_copy[worker]['max_work_days']
        )
        for boat_index, boat in enumerate(dates_copy[date]['boats']):
            schedule[date]['boats'].append({'workers': [], 'remaining_workers': boat['num_of_workers'], 'remaining_experties': boat['mandatory_experties']})
            # Assign workers based on mandatory expertises
            for experty in schedule[date]['boats'][boat_index]['remaining_experties']:
                workers_with_experty = [worker for worker in available_workers_sorted if experty in workers_copy[worker]['experties']]
                for worker in workers_with_experty:
                    if schedule[date]['boats'][boat_index]['remaining_experties'][experty] > 0:
                        add_worker_to_schedule(worker, available_workers_sorted, workers_copy, schedule[date]['boats'][boat_index]['remaining_experties'], schedule, date, boat_index)
                        workers_with_experty.remove(worker)
            if schedule[date]['boats'][boat_index]['remaining_experties'][experty] > 0: 
                print(f'No more workers with expertise {experty} on date {date}')
        # Assign remaining workers
        for boat_index, boat in enumerate(schedule[date]['boats']):
            for _ in range(schedule[date]['boats'][boat_index]['remaining_workers']):
                if available_workers_sorted:
                    add_worker_to_schedule(available_workers_sorted[0], available_workers_sorted, workers_copy, schedule[date]['boats'][boat_index]['remaining_experties'], schedule, date, boat_index)

        # Find all the workers that could be replaced
        for boat_index, boat in enumerate(schedule[date]['boats']):
            for worker in schedule[date]['boats'][boat_index]['workers']:
                is_replaceable = True
                for worker_experty in workers_copy[worker]['experties']:
                    # Check if all the worker's expertises are booked and have an extra worker with this expertise
                    if schedule[date]['boats'][boat_index]['remaining_experties'][worker_experty] >= 0:
                        is_replaceable = False
                        break
                if is_replaceable:
                    schedule[date]['replaceable_workers'].append(worker)
            # schedule[date]['experties'] = schedule[date]['boats'][boat_index]['remaining_experties']

    # Check if there are workers that can be replaced to complete the missing expertises
    for date in schedule:
        for boat_index2, boat in enumerate(schedule[date]['boats']):
            for experty in boat['remaining_experties']:
                if boat['remaining_experties'][experty] > 0:
                    replaced = False
                    # find workers with the required experty and available on the required date
                    workers_with_experty = [worker for worker in workers if experty in workers[worker]['experties'] and worker in dates[date]['available_workers'] and worker not in boat['workers']]
                    for worker in workers_with_experty: # david
                        if not replaced:
                            # find dates that this worker is scheduled to work
                            schedule_dates = {date_x: boat_index for date_x in schedule for boat_index, boat_x in enumerate(schedule[date_x]['boats']) if worker in boat_x['workers']}
                            # keep only the dates that the worker in replaceable_workers
                            schedule_dates = {date_x: boat_index for date_x, boat_index in schedule_dates.items() if worker in schedule[date_x]['replaceable_workers']}
                            for scheduled_date in schedule_dates.keys():
                                # workers to replace:
                                # should be replaceable on the date we are looking
                                # should not be already in the scheduled_date we are replacing, but should be available on this date.
                                workers_to_replace = [worker_x for worker_x in schedule[date]['replaceable_workers'] if all(worker_x not in boat['workers'] for boat in schedule[scheduled_date]['boats']) and worker_x in dates[scheduled_date]['available_workers']]
                                if workers_to_replace != []:
                                    replace_workers(worker, scheduled_date, schedule_dates[scheduled_date], workers_to_replace[0], date, boat_index2, schedule)
                                    replaced = True
                                    break
    for date in schedule:
        for boat_index, boat in enumerate(schedule[date]['boats']):
            print(f"{date}: {schedule[date]['boats'][boat_index]['workers']}")
    return schedule

def check_schedule(schedule, workers, dates):
    """ Check if the schedule is valid """
    issues = []
    
    for date in schedule:
        # Check if the number of workers is correct
        if len(schedule[date]['workers']) != dates[date]['num_of_workers']:
            issues.append(f'Wrong number of workers on date {date}. Expected {dates[date]["num_of_workers"]}, got {len(schedule[date]["workers"])}')
        # Check if the workers are in the available workers for the date
        for worker in schedule[date]['workers']:
            if worker not in dates[date]['available_workers']:
                issues.append(f'Worker {worker} was not signed to date {date}')
        # Check if the workers have the required expertises
        mandatory_experties_copy = deepcopy(dates[date]['mandatory_experties'])
        for worker in schedule[date]['workers']:
            for experty in workers[worker]['experties']:
                mandatory_experties_copy[experty] -= 1
        for experty in mandatory_experties_copy:
            if mandatory_experties_copy[experty] > 0:
                issues.append(f'Date {date} does not have the required expertise {experty}')
    # Check if the workers have more work days than allowed
    for worker in workers:
        if workers[worker]['max_work_days'] < len([date for date in schedule if worker in schedule[date]['workers']]):
            issues.append(f'Worker {worker} has more work days than allowed')
    return issues

def replace_workers(worker1, date1, boat_index1, worker2, date2, boat_index2, schedule):
    """ replace worker1 with worker2 in the schedule """
    if worker1 not in schedule[date2]['boats'][boat_index2]['workers'] and worker2 not in schedule[date1]['boats'][boat_index1]['workers'] and worker1 in schedule[date1]['replaceable_workers'] and worker2 in schedule[date2]['replaceable_workers'] and worker1 in schedule[date1]['boats'][boat_index1]['workers'] and worker2 in schedule[date2]['boats'][boat_index2]['workers']:
        schedule[date1]['boats'][boat_index1]['workers'].remove(worker1)
        schedule[date1]['boats'][boat_index1]['workers'].append(worker2)
        schedule[date2]['boats'][boat_index2]['workers'].remove(worker2)
        schedule[date2]['boats'][boat_index2]['workers'].append(worker1)
        schedule[date1]['replaceable_workers'].remove(worker1)
        schedule[date2]['replaceable_workers'].remove(worker2)
        # update the experties
        for experty in schedule[date1]['boats'][boat_index1]['remaining_experties']:
            if experty in workers[worker1]['experties']:
                schedule[date1]['boats'][boat_index1]['remaining_experties'][experty] += 1
            if experty in workers[worker2]['experties']:
                schedule[date1]['boats'][boat_index1]['remaining_experties'][experty] -= 1
        for experty in schedule[date2]['boats'][boat_index2]['remaining_experties']:
            if experty in workers[worker2]['experties']:
                schedule[date2]['boats'][boat_index2]['remaining_experties'][experty] += 1
            if experty in workers[worker1]['experties']:
                schedule[date2]['boats'][boat_index2]['remaining_experties'][experty] -= 1
        print(f'Replaced {worker1} with {worker2} in {date1} and {date2}')
    else:
        print(f'A replacement of {worker1} with {worker2} in {date1} and {date2} is not possible')
        
def add_worker_to_schedule(worker, available_workers_sorted, workers_copy, experties_to_book, schedule, date, boat_index):
    available_workers_sorted.remove(worker)
    workers_copy[worker]['max_work_days'] -= 1
    # remove all the required experties on this date
    for worker_experty in workers_copy[worker]['experties']:
        experties_to_book[worker_experty] -= 1

    schedule[date]['boats'][boat_index]['workers'].append(worker)
    schedule[date]['boats'][boat_index]['remaining_workers'] -= 1

if __name__ == '__main__':
    workers = {
        'Alice': {'max_work_days': 2, 'experties': ['a', 'b', 'c']},
        'Bob': {'max_work_days': 2, 'experties': ['a', 'b', 'c']},
        'Charlie': {'max_work_days': 2, 'experties': ['a', 'b']},
    }

    dates = {
        '1/1/2025': {'available_workers': ["Alice", "Bob", "Charlie"], 'boats': [{'mandatory_experties': {'a': 0, 'b': 0, 'c': 0}, 'num_of_workers': 0}, {'mandatory_experties': {'a': 1, 'b': 1, 'c': 1}, 'num_of_workers': 2}]},
        '2/1/2025': {'available_workers': ["Alice", "Bob", "Charlie"], 'boats': [{'mandatory_experties': {'a': 1, 'b': 1, 'c': 1}, 'num_of_workers': 2}]},
        '3/1/2025': {'available_workers': ["Alice", "Bob", "Charlie"], 'boats': [{'mandatory_experties': {'a': 0, 'b': 0, 'c': 2}, 'num_of_workers': 2}]},
    }

    schedule = schedule_workers(workers, dates)
    print(check_schedule(schedule, workers, dates))

    
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

# 4/1/2025: ['Alice', 'Grace', 'David', 'Frank', 'Charlie']
# 1/1/2025: ['Eve', 'Alice', 'Ivan', 'Grace', 'Bob']
# 2/1/2025: ['Eve', 'Alice', 'Ivan', 'Grace', 'Frank']
# 3/1/2025: ['Alice', 'Grace', 'John', 'Charlie', 'David']
# 6/1/2025: ['Eve', 'Frank', 'David', 'Heidi', 'Grace']
# 5/1/2025: ['Eve', 'Alice', 'Heidi', 'Charlie', 'David']

# 1/1/2025: ['Eve', 'Alice', 'Ivan', 'David', 'Bob']
# 1/1/2025: ['Charlie', 'Grace']
# 4/1/2025: ['Alice', 'Grace', 'David', 'Frank', 'Charlie']
# 2/1/2025: ['Eve', 'Grace', 'Ivan', 'Alice', 'Frank']
# 3/1/2025: ['Alice', 'Grace', 'John', 'Frank', 'David']
# 6/1/2025: ['Eve', 'Grace', 'David', 'Heidi', 'Charlie']
# 5/1/2025: ['Eve', 'Alice', 'Heidi', 'Frank', 'Grace']