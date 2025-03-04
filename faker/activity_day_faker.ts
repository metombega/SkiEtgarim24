import { Activity } from "@/types/activityDay";
import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { firebaseConfig } from '../app/config/firebase';
import { ServiceAccount } from 'firebase-admin';

// Initialize Firebase
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: firebaseConfig['databaseURL']
});

export const createRandomActivity = (availableVolunteers: string[], date: Date): Activity => {
  return {
    date: date,
    status: "initialized",
    skiType: "",
    surfer: "",
    numberOfAdditionalSurfers: 0,
    numberOfAdditionalGuests: 0,
    startTime: "09:00",
    endTime: "12:00",
    availableVolunteers: availableVolunteers,
    activityManager: "",
    volunteers: [],
  };
};

const saveActivity = async (activity: Activity): Promise<void> => {
  try {
    const db = getDatabase();
    const formattedDate = activity.date.toISOString().slice(0, 10); // Format date to yyyy-mm-dd
    const activityRef = db.ref(`/activities/${formattedDate}`);
    await activityRef.set(activity);
    console.log('Activity saved successfully');
  } catch (error) {
    console.error('Error saving activity:', error);
  }
};

const date_to_workers = {
  '1/1/2025': ['Alice', 'Charlie', 'David', 'Eve', 'Grace', 'Heidi', 'Ivan'],
  '2/1/2025': ['Alice', 'David', 'Eve', 'Frank', 'Grace', 'Ivan'],
  '3/1/2025': ['Alice', 'Charlie', 'David', 'Frank', 'Grace', 'Ivan'],
  '4/1/2025': ['Alice', 'Charlie', 'Frank', 'Grace', 'Ivan', 'David'],
  '5/1/2025': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi'],
  '6/1/2025': ['Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi']
};

const activities = Object.entries(date_to_workers).map(([date, availableVolunteers]) => ({
  date: new Date(date),
  availableVolunteers: availableVolunteers
}));

(async () => {
  for (const activityData of activities) {
    const activity = createRandomActivity(activityData.availableVolunteers, activityData.date);
    await saveActivity(activity);
  }
})();