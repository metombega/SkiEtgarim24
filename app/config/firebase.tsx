import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBfGVa-ma220hj9aT2P-UlLspUqZp5YeSk",
  authDomain: "ski-etgarim-092924.firebaseapp.com",
  databaseURL: "https://ski-etgarim-092924-default-rtdb.firebaseio.com",
  projectId: "ski-etgarim-092924",
  storageBucket: "ski-etgarim-092924.firebasestorage.app",
  messagingSenderId: "742818032503",
  appId: "1:742818032503:web:9bf358eaf5f59987310f72",
  measurementId: "G-0VJSRDDYSZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

export { auth };
