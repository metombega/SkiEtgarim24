import { Activity } from "@/types/activityDay";
import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { firebaseConfig } from '../app/config/firebase';
import { ServiceAccount } from 'firebase-admin';

export const createRandomActivity = (availableVolunteers: string[], date: Date): Activity => {
    return {
        date: date,
        status: "Initialized",
        skiType: "Alpine",
        surfer: "John Doe",
        numberOfAdditionalSurfers: 0,
        numberOfAdditionalGuests: 0,
        startTime: "09:00",
        endTime: "12:00",
        availableVolunteers: availableVolunteers,
        activityManager: "",
        volunteers: [],
    };
};

async function saveActivity(activity: Activity): Promise<void> {
    try {
        const db = getDatabase();
        const activityRef = db.ref(`/activities/${activity.date}`);
        await activityRef.set({
            date: activity.date,
            status: activity.status,
            skiType: activity.skiType,
            surfer: activity.surfer,
            numberOfAdditionalSurfers: activity.numberOfAdditionalSurfers,
            numberOfAdditionalGuests: activity.numberOfAdditionalGuests,
            startTime: activity.startTime,
            endTime: activity.endTime,
            availableVolunteers: activity.availableVolunteers,
            activityManager: activity.activityManager,
            volunteers: activity.volunteers,
        });
        console.log('Activity saved successfully');
    } catch (error) {
        console.error('Error saving activity:', error);
    }
}

export const saveRandomActivity = async (): Promise<void> => {
    const activity: Activity = createRandomActivity([], new Date());
    const serviceAccount = require('../serviceAccountKey.json'); // Ensure this path is correct

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
        databaseURL: firebaseConfig['databaseURL']
    });

    await saveActivity(activity);
};

(async () => {
    await saveRandomActivity();
})();