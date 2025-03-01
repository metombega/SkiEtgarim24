import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { firebaseConfig } from '../app/config/firebase';
import { Volunteer, volunteerAbilitiesTypes, volunteerCertificationsTypes } from '../types/user';
import { ServiceAccount } from 'firebase-admin';

// Initialize Firebase
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: firebaseConfig['databaseURL']
});

const createVolunteer = (id: string, certifications: string[], maxWeekdays: number, maxWeekends: number): Volunteer => {
return {
    id: id,
    username: id,
    phoneNumber: '1234567890',
    email: `${id}@example.com`,
    fullName: id,
    height: 170,
    age: 30,
    sex: 'M',
    emeregencyContactName: 'Emergency Contact',
    emeregencyContactPhoneNumber: '0987654321',
    sittingChairNumber: 1,
    sittingSizeMessure: 1,
    sittingPosition: 1,
    floatingBeltSize: 'M',
    joinYear: 2020,
    senioretyYears: 2,
    abilities: volunteerAbilitiesTypes.map(type => ({ type, rank: 1, comments: '' })),
    certifications: volunteerCertificationsTypes.map(type => ({
        type,
        exists: certifications.includes(type),
        comments: ''
    })),
    isActivityManager: false,
    isAdministrator: false,
    signedForNextPeriod: true,
    maxWeekdays: maxWeekdays,
    maxWeekends: maxWeekends,
    maxWorkDays: maxWeekdays + maxWeekends,
};
};

const saveVolunteer = async (volunteer: Volunteer): Promise<void> => {
  try {
    const db = getDatabase();
    const volunteerRef = db.ref(`/users/ski-team/${volunteer.id}`);
    await volunteerRef.set(volunteer);
    console.log('Volunteer saved successfully');
  } catch (error) {
    console.error('Error saving volunteer:', error);
  }
};

const workers = {
    'Alice': { 'max_work_days': 3, 'experties': ['driver', 'activity_manager', 'skipper'] },
    'Bob': { 'max_work_days': 2, 'experties': ['skipper', 'activity_manager'] },
    'Charlie': { 'max_work_days': 3, 'experties': ['driver', 'activity_manager'] },
    'David': { 'max_work_days': 4, 'experties': ['activity_manager', 'skipper'] },
    'Eve': { 'max_work_days': 4, 'experties': ['driver', 'activity_manager', 'skipper'] },
    'Frank': { 'max_work_days': 1, 'experties': ['driver', 'activity_manager', 'skipper'] },
    'Grace': { 'max_work_days': 4, 'experties': ['activity_manager'] },
    'Heidi': { 'max_work_days': 1, 'experties': [] },
    'Ivan': { 'max_work_days': 2, 'experties': ['driver', 'skipper'] }
  };
  
  (async () => {
    for (const [name, details] of Object.entries(workers)) {
      const volunteer = createVolunteer(name, details.experties, details.max_work_days - 1, 1);
      await saveVolunteer(volunteer);
    }
  })();