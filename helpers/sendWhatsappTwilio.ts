import { getVolunteersPhoneNumbers } from "./getVolunteersPhoneNumbers";
import twilio from "twilio";

const accountSid = ""; // Replace with your Twilio Account SID
const authToken = ""; // Replace with your Twilio Auth Token
const client = twilio(accountSid, authToken);

export const sendWhatsAppToAll = async () => {
  try {
    //const phoneNumbers = await getVolunteersPhoneNumbers(); // Fetch phone numbers from Firebase
    const message = "Hello Volunteers, this is a message from SkiEtgarim24.";
    const phoneNumbers = "+972509777754"

    /*
    const formattedNumber = `whatsapp:${phoneNumber}`;
    client.messages
    .create({
        body: message,
        from: "whatsapp:+16205089554", // Replace with your Twilio WhatsApp number
        to: formattedNumber,
    })
    .then((message) => console.log(`Message sent to ${phoneNumber}: ${message.sid}`))
    .catch((err) => console.error(`Failed to send message to ${phoneNumber}`, err));
    */
    

    // Log the phone numbers to the console
    //console.log("Sending WhatsApp message to the following numbers:", phoneNumbers);

    // Iterate over the phone numbers and send a WhatsApp message to each
    
    for (const phoneNumber of phoneNumbers) {

      const formattedNumber = `whatsapp:${phoneNumber}`;
      client.messages
        .create({
          body: message,
          from: "whatsapp:+16205089554", // Replace with your Twilio WhatsApp number
          to: formattedNumber,
        })
        .then((message) => console.log(`Message sent to ${phoneNumber}: ${message.sid}`))
        .catch((err) => console.error(`Failed to send message to ${phoneNumber}`, err));
    }
    
  } catch (error) {
    console.error("Failed to fetch phone numbers", error);
  }
};