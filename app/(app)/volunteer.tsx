import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomVolunteerCalendar from "@/components/CustomVolunteerCalendar";
import { getAuth } from "firebase/auth";

export default function Volunteer() {
  const router = useRouter();
  const auth = getAuth();
  console.log(`User ID: ${auth.currentUser?.email}`);

  return (
    <View style={styles.container}>
      <Text>Activity Calendar</Text>
      <CustomVolunteerCalendar volunteerId={auth.currentUser?.email || ""} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
});
