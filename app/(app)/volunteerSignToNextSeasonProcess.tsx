import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CustomSigningCalendar from "../../components/CustomSigningCalendar";
import { getDatabase, ref, push } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function VolunteerSignToNextSeasonProcess() {
  const [weekdayDates, setWeekdayDates] = useState(0);
  const [weekendDates, setWeekendDates] = useState(0);
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const incrementWeekday = () => setWeekdayDates(weekdayDates + 1);
  const decrementWeekday = () => {
    if (weekdayDates > 0) setWeekdayDates(weekdayDates - 1);
  };

  const incrementWeekend = () => setWeekendDates(weekendDates + 1);
  const decrementWeekend = () => {
    if (weekendDates > 0) setWeekendDates(weekendDates - 1);
  };

  const handleSave = async (selectedDates: string[]) => {
    if (!user) {
      console.error("No user logged in!");
      return;
    }
    const db = getDatabase();
    console.log("Selected dates", selectedDates);
    // Save volunteer in the activities
    for (const selectedDate of selectedDates) {
      const volunteerListRef = ref(
        db,
        "activities/" + selectedDate + "/volunteers"
      );
      push(volunteerListRef, user.email)
        .then(() => console.log("Volunteer added successfully!"))
        .catch((error) => console.error("Error adding volunteer:", error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer Sign Up for Next Season</Text>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>
          Maximum volunteering days on weekday
        </Text>
        <View style={styles.stepper}>
          <TouchableOpacity onPress={decrementWeekday} style={styles.button}>
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
          <Text style={styles.number}>{weekdayDates}</Text>
          <TouchableOpacity onPress={incrementWeekday} style={styles.button}>
            <Text style={styles.buttonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>
          Maximum volunteering days on weekend
        </Text>
        <View style={styles.stepper}>
          <TouchableOpacity onPress={decrementWeekend} style={styles.button}>
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
          <Text style={styles.number}>{weekendDates}</Text>
          <TouchableOpacity onPress={incrementWeekend} style={styles.button}>
            <Text style={styles.buttonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CustomSigningCalendar
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onSave={handleSave}
        scheduledDates={scheduledDates}
      />
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
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    marginBottom: 10,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 20,
  },
  number: {
    fontSize: 20,
    minWidth: 40,
    textAlign: "center",
  },
});
