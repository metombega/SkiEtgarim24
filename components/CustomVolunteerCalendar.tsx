import React, { FC, useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { getDatabase, ref, onValue, off } from "firebase/database";

interface VolunteerActivityCalendarProps {
  volunteerId: string;
}

const VolunteerActivityCalendar: FC<VolunteerActivityCalendarProps> = ({
  volunteerId,
}) => {
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  useEffect(() => {
    const db = getDatabase();
    const activitiesRef = ref(db, "activities");
    let volunteerListeners: Array<() => void> = [];

    const unsubscribeActivities = onValue(activitiesRef, (snapshot) => {
      volunteerListeners.forEach((unsubscribe) => unsubscribe());
      volunteerListeners = [];

      const activitiesData = snapshot.val() || {};
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
          // Change the marking color to green if the volunteer is assigned
          if (volunteerData[volunteerId]) {
            newMarkedDates[activityDate] = {
              selected: true,
              selectedColor: "green",
            };
          } else {
            newMarkedDates[activityDate] = {
              selected: true,
              selectedColor: "red",
            };
          }
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

  return <Calendar markedDates={markedDates} />;
};

export default VolunteerActivityCalendar;
