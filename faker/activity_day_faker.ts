import { Activity } from "@/types/activity_day";
import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { firebaseConfig } from '../app/config/firebase';
import { ServiceAccount } from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

function getRandomDate(): Date {
    const startTimestamp: number = new Date(2024, 0, 1).getTime();
    const endTimestamp: number = new Date(2024, 11, 11).getTime();
    const randomTimestamp: number = startTimestamp + Math.random() * (endTimestamp - startTimestamp);
    return new Date(randomTimestamp);
}

export const createRandomActivity = (): Activity => {
    return {
        id: uuidv4(), // Generate a unique ID
        date: getRandomDate().toDateString(),
        startTime: "08:00",
        endTime: "12:00",
        surfer: "surfer",
        ski_type: "standing",
        number_of_additional_surfers: 0,
        number_of_additional_guests: 1,
        activity_manager: "activity_manager",
        volunteers: [{ id: "1", username: "volunteer", password: "password", phoneNumber: "1234567890", email: "", fullName: "volunteer", age: 20, hight: 180, sittingSizeMessure: 50, floatingBeltSize: 100, joinYear: 2020, senioretyYears: 5, sex: "M", emergencyContact: { name: "contact", phoneNumber: "1234567890" }, abilities: [{ type: "ability", rank: 1, comments: "" }], certifications: [{ exists: true, type: "certification", comments: "" }] }],
        start_report: { activity_manager: "activity_manager" },
        end_report: { activity_manager: "activity_manager" },
        equipments: [{ subject: "ski", quantity: 1, condition: "Good", remarks: "" }, { subject: "Life Jacket", quantity: 6, condition: "Good", remarks: "" }],
        boat: { id: 1, name: "boat", type: "boat", engineTime: 100, ongoingTreatment: "treatment", lastTest: new Date(), nextTest: new Date(), malfunctions: [], patrolLeft: 5 },
    };
};

async function saveActivity(activity: Activity): Promise<void> {
    try {
        const db = getDatabase();
        const activityRef = db.ref(`/activities/${activity.id}`);
        await activityRef.set({
            date: activity.date,
            startTime: activity.startTime,
            endTime: activity.endTime,
            surfer: activity.surfer,
            ski_type: activity.ski_type,
            number_of_additional_surfers: activity.number_of_additional_surfers,
            number_of_additional_guests: activity.number_of_additional_guests,
            activity_manager: activity.activity_manager,
            volunteers: activity.volunteers,
            start_report: activity.start_report,
            end_report: activity.end_report,
            equipments: activity.equipments,
            boat: activity.boat,
        });
        console.log('Activity saved successfully');
    } catch (error) {
        console.error('Error saving activity:', error);
    }
}

export const saveRandomActivity = async (): Promise<void> => {
    const activity: Activity = createRandomActivity();
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