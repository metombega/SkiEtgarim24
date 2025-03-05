import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";

interface WhatsappButtonProps {
  title: string;
  message: string;
  //onPress: () => void;
}

const WhatsappButton: React.FC<WhatsappButtonProps> = ({ title, message }) => {
  const handlePress = () => {
    Alert.alert("Message", message);
  };
  
  return (
    <TouchableOpacity style={styles.greenButton} onPress={handlePress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  greenButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default WhatsappButton;