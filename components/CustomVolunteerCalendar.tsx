import React, { FC, useEffect, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { getDatabase, ref, onValue, off } from "firebase/database";

interface VolunteerActivityCalendarProps {
  volunteerId: string;
  selectedDay?: string | null;
  setSelectedDay: (day: string | null) => void;
}

const VolunteerActivityCalendar: FC<VolunteerActivityCalendarProps> = ({
  volunteerId,
  selectedDay,
  setSelectedDay,
}) => {
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  useEffect(() => {
    const db = getDatabase();
    // Reference the "activities" node
    const activitiesRef = ref(db, "activities");
    let volunteerListeners: Array<() => void> = [];

    const unsubscribeActivities = onValue(activitiesRef, (snapshot) => {
      // Remove any existing volunteer listeners when activities update
      volunteerListeners.forEach((unsubscribe) => unsubscribe());
      volunteerListeners = [];

      const activitiesData = snapshot.val() || {};
      const newMarkedDates: Record<string, any> = {};

      // For each activity, get the date from "activities/{activityKey}/date"
      Object.keys(activitiesData).forEach((activityKey) => {
        const activity = activitiesData[activityKey];
        const activityDate = activity.date;
        if (!activityDate) return; // Skip if date is not defined

        // Default marking (red)
        newMarkedDates[activityDate] = {
          selected: false,
          selectedColor: "red",
          marked: true,
        };

        // Listen for volunteer data on this activity's volunteers path
        const volunteerRef = ref(db, `activities/${activityKey}/volunteers`);
        const unsubscribeVolunteer = onValue(volunteerRef, (volSnapshot) => {
          const volunteerData = volSnapshot.val() || {};
          // Change the marking color to green if the volunteer is assigned
          if (volunteerData[volunteerId]) {
            newMarkedDates[activityDate] = {
              selected: false,
              selectedColor: "green",
              marked: true,
            };
          } else {
            newMarkedDates[activityDate] = {
              selected: false,
              selectedColor: "red",
              marked: true,
            };
          }
          setMarkedDates({ ...newMarkedDates });
        });
        // Store the unsubscribe function for the volunteer listener
        volunteerListeners.push(() =>
          off(volunteerRef, "value", unsubscribeVolunteer)
        );
      });

      // Update markedDates with data from all activities
      setMarkedDates({ ...newMarkedDates });
    });

    return () => {
      // Clean up the activities listener...
      off(activitiesRef, "value", unsubscribeActivities);
      // ...and all volunteer listeners.
      volunteerListeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [volunteerId]);

  const handleDayPress = (day: DateData) => {
    if (markedDates[day.dateString]) {
      setSelectedDay(day.dateString);
    } else {
      setSelectedDay(null);
    }
  };

  return (
    <Calendar
      onDayPress={handleDayPress}
      markedDates={{
        ...markedDates,
        ...(selectedDay
          ? {
              [selectedDay]: {
                ...markedDates[selectedDay],
                selected: true,
              },
            }
          : {}),
      }}
    />
  );
};

export default VolunteerActivityCalendar;
