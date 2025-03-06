import { getDatabase, ref, child, get } from "firebase/database";
import { db } from "@/app/config/firebase"; // Adjust the import path as necessary

export const getVolunteersPhoneNumbers = async () => {
  const phoneNumbers: string[] = [];
  const dbRef = ref(getDatabase());
  try {
    const snapshot = await get(child(dbRef, "users/ski-team"));
    console.log("######### snapshot snapshot", snapshot);
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.phoneNumber) {
          phoneNumbers.push(data.phoneNumber);
        } else {
          console.warn("######## User is missing a phone number");
        }        
      });
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
  return phoneNumbers;
};