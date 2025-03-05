import React, { useState } from "react";
import { View, StyleSheet, Text, Button, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import CustomCalendar from "@/components/CustomCalendar";
import CustomButton from "@/components/CustomButton";
import { Colors } from "../config/constants/constants";
import WhatsappButton from "@/components/WhatsappButton";
//import { sendWhatsAppToAll } from "@/helpers/sendWhatsApp";

export default function Admin() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  //send whatsapp message function

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>לוח פעילויות</Text>
        <CustomCalendar setSelectedDay={setSelectedDay} />
        <View style={styles.space} />
        <Button
          title="צור לוח פעילויות לעונה הבאה"
          onPress={() => router.push("/scheduling")}
        />
        <View style={styles.space} />
        <WhatsappButton
          title="Send Whatsapp to All"
          message="WhatsApp message sent to all volunteers."
          //onPress={sendWhatsAppToAll}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>בסיס נתונים</Text>
        <CustomButton
          title="מתנדבים"
          description="ניהול מתנדבים"
          imageSource={require("@/assets/images/react-logo.png")}
          onPress={() => router.push("/volunteers_management")}
        />
        <CustomButton
          title="גולשים"
          description="ניהול גולשים"
          imageSource={require("@/assets/images/react-logo.png")}
          onPress={() => router.push("/surfers_management")}
        />
        <CustomButton
          title="ציוד"
          description="ניהול ציוד"
          imageSource={require("@/assets/images/react-logo.png")}
          onPress={() => router.push("/admin")}
        />
        <CustomButton
          title="דוחות"
          description="צפייה בדוחות"
          imageSource={require("@/assets/images/react-logo.png")}
          onPress={() => router.push("/admin")}
        />
        <CustomButton
          title="שיבוצי מתנדבים"
          description="ניהול שיבוצים"
          imageSource={require("@/assets/images/react-logo.png")}
          onPress={() => router.push("/admin")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  space: {
    height: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
    color: Colors.dark_blue,
  },greenButton: {
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
