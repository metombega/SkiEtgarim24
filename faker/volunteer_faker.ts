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

const nameToIdMap = {
  'Alice': 'CMpAsJHhzFMzbULrXL6qRQAAImh2',
  'Bob': 'dDxY2uaWiDN0SoiTBOLFuFWmKE42',
  'Charlie': 'b3njZnGVGNOG4ayWKWh8xBUqIE92',
  'David': 'MqbE93fZJkOAAYP21iX5nTOlzOh2',
  'Eve': 'byKf10gLG5QeNseuORABdghLYUv1',
  'Frank': 'mMXUHdYqN8Oj7TZyKBYeO1Pm9Iz1',
  'Grace': 'JeAeKPzCrcRgaJD16MpBsI3g9A13',
  'Heidi': 'HuxzSEVjl1Nr2GuAwskkiRcKIwZ2',
  'Ivan': 'ze1W9jfHRBdb9b0lQ1BFKHKLNsE2',
};

const createVolunteer = (id: keyof typeof nameToIdMap, certifications: string[], maxWeekdays: number, maxWeekends: number): Volunteer => {
  return {
      id: nameToIdMap[id],
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
    'Alice': { 'maxWorkDays': 3, 'certifications': ['driver', 'activity_manager', 'skipper'] },
    'Bob': { 'maxWorkDays': 2, 'certifications': ['activity_manager'] },
    'Charlie': { 'maxWorkDays': 3, 'certifications': ['driver', 'activity_manager'] },
    'David': { 'maxWorkDays': 4, 'certifications': ['activity_manager', 'skipper'] },
    'Eve': { 'maxWorkDays': 4, 'certifications': ['driver', 'activity_manager', 'skipper'] },
    'Frank': { 'maxWorkDays': 1, 'certifications': ['driver', 'activity_manager', 'skipper'] },
    'Grace': { 'maxWorkDays': 4, 'certifications': ['activity_manager'] },
    'Heidi': { 'maxWorkDays': 1, 'certifications': [] },
    'Ivan': { 'maxWorkDays': 2, 'certifications': ['driver', 'skipper'] }
  };
  
  (async () => {
    for (const [name, details] of Object.entries(workers)) {
      const volunteer = createVolunteer(name as keyof typeof nameToIdMap, details.certifications, details.maxWorkDays - 1, 1);
      await saveVolunteer(volunteer);
    }
  })();