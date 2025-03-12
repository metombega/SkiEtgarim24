import { Linking } from "react-native";
import { getVolunteersPhoneNumbers } from "./getVolunteersPhoneNumbers";

export const sendWhatsAppToAll = async () => {
  try {
    //const phoneNumbers = await getVolunteersPhoneNumbers(); // Fetch phone numbers from Firebase
    const message = "Hello Volunteers, this is a message from SkiEtgarim24.";
    //const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Log the phone numbers to the console
    //console.log("Sending WhatsApp message to the following numbers:", phoneNumbers);
    //console.log("Type of phoneNumbers: ", typeof phoneNumbers); // Log the type of phoneNumbers
    

    // Iterate over the phone numbers and send a WhatsApp message to each
    
    //const phoneNumber = "+972509777754"
    const phoneNumbers = ['+972509777754', '+972546133118'];
    
    // Log the phone numbers to the console
    console.log("Sending WhatsApp message to the following numbers:", phoneNumbers);
    console.log("Type of phoneNumber: ", phoneNumbers);

    //const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    //console.log(`Opening WhatsApp for ${phoneNumber} with URL: ${url}`);
    //Linking.openURL(url).catch(err => console.error("Failed to open WhatsApp", err));

    
    for (const phoneNumber of phoneNumbers) {
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      console.log(`Opening WhatsApp for ${phoneNumber} with URL: ${url}`);
      Linking.openURL(url).catch(err => console.error("Failed to open WhatsApp", err));
    }
    

    // Open WhatsApp with the pre-filled message
    //Linking.openURL(url).catch(err => console.error("Failed to open WhatsApp", err));
  } catch (error) {
    console.error("Failed to fetch phone numbers", error);
  }
};
