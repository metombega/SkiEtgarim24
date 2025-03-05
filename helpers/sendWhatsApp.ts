import { Linking } from "react-native";
import { getVolunteersPhoneNumbers } from "./getVolunteersPhoneNumbers";

export const sendWhatsAppToAll = async () => {
  try {
    const phoneNumbers = await getVolunteersPhoneNumbers(); // Fetch phone numbers from Firebase
    const message = "Hello Volunteers, this is a message from SkiEtgarim24.";
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Open WhatsApp with the pre-filled message
    Linking.openURL(url).catch(err => console.error("Failed to open WhatsApp", err));
  } catch (error) {
    console.error("Failed to fetch phone numbers", error);
  }
};