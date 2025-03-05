import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();

export const getVolunteersPhoneNumbers = async () => {
  const phoneNumbers: string[] = [];
  const querySnapshot = await getDocs(collection(db, "volunteers"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.phoneNumber) {
      phoneNumbers.push(data.phoneNumber);
    }
  });
  return phoneNumbers;
};