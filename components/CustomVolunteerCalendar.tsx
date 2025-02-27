import React, { FC, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
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
      if (Platform.OS === "web") {
        window.alert("No activities: No activity scheduled for this date.");
      } else {
        Alert.alert("No activities", "No activity scheduled for this date.");
      }
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

    if (Platform.OS === "web") {
      window.alert(`Activities on ${selectedDate}\n\n${message}`);
    } else {
      Alert.alert(`Activities on ${selectedDate}`, message);
    }
  };

  return <Calendar markedDates={markedDates} onDayPress={handleDayPress} />;
};

export default VolunteerActivityCalendar;
