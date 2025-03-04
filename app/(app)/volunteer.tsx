import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import CustomVolunteerCalendar from "@/components/CustomVolunteerCalendar";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { router, useRouter } from "expo-router";

export default function Volunteer() {
  const router = useRouter();
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <View style={styles.container}>
      <Text>Activity Calendar</Text>
      <CustomVolunteerCalendar volunteerId={user?.uid || ""} />
      <Button
        title="sign up for next season"
        onPress={() => router.push("/volunteerSignToNextSeasonProcess")}
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
