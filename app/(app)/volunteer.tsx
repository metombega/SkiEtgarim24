import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomVolunteerCalendar from "@/components/CustomVolunteerCalendar";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function Volunteer() {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(`User ID: ${user?.email}`);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <View style={styles.container}>
      <Text>Activity Calendar</Text>
      <CustomVolunteerCalendar volunteerId={user?.email || ""} />
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
