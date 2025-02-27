import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CustomSigningCalendar from "../../components/CustomSigningCalendar";
import { getDatabase, ref, set, remove } from "firebase/database";

export default function VolunteerSignToNextSeasonProcess() {
  const [weekdayDates, setWeekdayDates] = useState(0);
  const [weekendDates, setWeekendDates] = useState(0);

  const incrementWeekday = () => setWeekdayDates(weekdayDates + 1);
  const decrementWeekday = () => {
    if (weekdayDates > 0) setWeekdayDates(weekdayDates - 1);
  };

  const incrementWeekend = () => setWeekendDates(weekendDates + 1);
  const decrementWeekend = () => {
    if (weekendDates > 0) setWeekendDates(weekendDates - 1);
  };
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);

  const handleSave = async (selectedDates: string[]) => {
    const db = getDatabase();

    // Remove dates that were previously saved but are not in the new selection
    for (const scheduledDate of scheduledDates) {
      if (!selectedDates.includes(scheduledDate)) {
        const activityDayRef = ref(db, "activities/" + scheduledDate);
        console.log("Removing date:", scheduledDate);
        await remove(activityDayRef);
      }
    }

    // Save new or re-save selected dates
    for (const selectedDate of selectedDates) {
      const activityDayRef = ref(db, "activities/" + selectedDate);
      await set(activityDayRef, {
        date: selectedDate,
        status: "initialized",
        skiType: "",
        surfer: "",
        numberOfAdditionalSurfers: 0,
        numberOfAdditionalGuests: 0,
        activityManager: "",
        volunteers: [],
        startTime: "",
        endTime: "",
        startReport: null,
        endReport: null,
        equipments: [],
        boat: null,
      });
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
