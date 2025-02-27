import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VolunteerSignToNextSeasonProcess() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer Sign Up for Next Season</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
