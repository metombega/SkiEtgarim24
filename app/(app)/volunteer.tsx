import React, { useState } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomVolunteerCalendar from "@/components/CustomVolunteerCalendar";

export default function Volunteer() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const userIdString = String(userId);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text>Activity Calendar</Text>
      <CustomVolunteerCalendar
        volunteerId={userIdString}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />
      <Button
        title="Sign To Next Period"
        onPress={() => alert(`Signed up for ${selectedDay}`)}
        disabled={!selectedDay}
      />
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
