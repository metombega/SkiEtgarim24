import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import CustomSigningCalendar from "../../components/CustomSigningCalendar";
import { getDatabase, ref, push, update } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function VolunteerSignToNextSeasonProcess() {
  const [weekdayDates, setWeekdayDates] = useState(0);
  const [weekendDates, setWeekendDates] = useState(0);
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

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
    if (Platform.OS === "web" && (weekdayDates === 0 || weekendDates === 0)) {
      const confirmed = window.confirm(
        "You have set either the weekday or weekend volunteering days to 0. Is that OK?"
      );
      if (!confirmed) {
        return;
      }
    }
    try {
      const db = getDatabase();
      console.log("Selected dates", selectedDates);
      // Save volunteer in the activities
      for (const selectedDate of selectedDates) {
        const volunteerListRef = ref(
          db,
          "activities/" + selectedDate + "/available_volunteers"
        );
        await push(volunteerListRef, user.uid);
        console.log("Volunteer added successfully!");
      }
      const volunteerRef = ref(db, "users/ski-team/" + user.uid);
      await update(volunteerRef, {
        signedForNextPeriod: true,
        weekdayDays: weekdayDates,
        weekendDays: weekendDates,
      });
      setModalVisible(true);
    } catch (error) {
      console.error("Error saving data:", error);
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

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Successfully Saved!</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Back to volunteer page</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});
