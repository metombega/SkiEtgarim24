import React, { FC, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { getDatabase, ref, onValue, off } from "firebase/database";

interface VolunteerActivityCalendarProps {
  volunteerId: string;
}

const VolunteerActivityCalendar: FC<VolunteerActivityCalendarProps> = ({
  volunteerId,
}) => {
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [activities, setActivities] = useState<Record<string, any>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const db = getDatabase();
    const activitiesRef = ref(db, "activities");
    let volunteerListeners: Array<() => void> = [];

    const unsubscribeActivities = onValue(activitiesRef, (snapshot) => {
      // Clear previous volunteer listeners
      volunteerListeners.forEach((unsubscribe) => unsubscribe());
      volunteerListeners = [];
      const activitiesData = snapshot.val() || {};
      setActivities(activitiesData);

      const newMarkedDates: Record<string, any> = {};

      Object.keys(activitiesData).forEach((activityKey) => {
        const activity = activitiesData[activityKey];
        const activityDate = activity.date;
        if (!activityDate) return; // Skip if date is not defined

        // Default marking (red)
        newMarkedDates[activityDate] = {
          selected: true,
          selectedColor: "red",
        };

        // Listen for volunteer data on this activity's volunteers path
        const volunteerRef = ref(db, `activities/${activityKey}/volunteers`);
        const unsubscribeVolunteer = onValue(volunteerRef, (volSnapshot) => {
          const volunteerData = volSnapshot.val() || {};
          const isAssigned = Object.values(volunteerData).includes(volunteerId);
          newMarkedDates[activityDate] = {
            selected: true,
            selectedColor: isAssigned ? "green" : "red",
          };
          setMarkedDates({ ...newMarkedDates });
        });
        volunteerListeners.push(() =>
          off(volunteerRef, "value", unsubscribeVolunteer)
        );
      });
      setMarkedDates({ ...newMarkedDates });
    });

    return () => {
      off(activitiesRef, "value", unsubscribeActivities);
      volunteerListeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [volunteerId]);

  // Handler to show all activity details when a date is pressed
  const handleDayPress = (day: { dateString: string }) => {
    const selectedDate = day.dateString;
    // Filter activities that have the selected date
    const activitiesOnDate = Object.entries(activities).filter(
      ([, activity]) => activity.date === selectedDate
    );

    if (activitiesOnDate.length === 0) {
      // Instead of native alert, show the custom modal
      setModalTitle("No activities");
      setModalMessage("No activity scheduled for this date.");
      setModalVisible(true);
      return;
    }

    let message = "";
    activitiesOnDate.forEach(([key, activity]) => {
      message += `Activity key: ${key}\n${JSON.stringify(
        activity,
        null,
        2
      )}\n\n`;
    });

    setModalTitle(`Activities on ${selectedDate}`);
    setModalMessage(message);
    setModalVisible(true);
  };

  return (
    <>
      <Calendar markedDates={markedDates} onDayPress={handleDayPress} />
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default VolunteerActivityCalendar;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalContent: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
  },
  modalButton: {
    alignSelf: "flex-end",
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
