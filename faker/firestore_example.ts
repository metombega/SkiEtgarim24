import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { firebaseConfig } from '../app/config/firebase';

// Initialize Firebase
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig['databaseURL']
});

const writeToFirebase = async (username: string, userId: string) => {
  const db = getDatabase();
  const userRef = db.ref(`/users_test/${userId}`);
  await userRef.set({ username });
  await userRef.child('leaderboard').set({ totalSteps: 0 });
  console.log('Profile created successfully');
};

// Example usage
(async () => {
  const username = 'John Doe 1';
  const userid = '1';

  // Write data to Firebase
  await writeToFirebase(username, userid);

})();