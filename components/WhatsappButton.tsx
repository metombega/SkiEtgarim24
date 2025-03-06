import { sendWhatsAppToAll } from "@/helpers/sendWhatsApp";
import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";

interface WhatsappButtonProps {
  title: string;
  message: string;
  onPress: () => void;
}

const WhatsappButton: React.FC<WhatsappButtonProps> = ({ title, message, onPress }) => {
  const handlePress = () => {
    //Alert.alert("Message", message);
    onPress();
  };
  
  return (
    <TouchableOpacity style={styles.WhatsappButton} onPress={handlePress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  WhatsappButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default WhatsappButton;