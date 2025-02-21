import React, { FC, useEffect, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { View, Button } from "react-native";
import { getDatabase, ref, get } from "firebase/database";

type CalendarProps = {
  selectedDay: string | null;
  setSelectedDay: React.Dispatch<React.SetStateAction<string | null>>;
  onSave: (selectedDates: string[]) => void;
  scheduledDates: string[];
};

const CustomCalendar: FC<CalendarProps> = ({ onSave }) => {
  // Replace separate states with one unified state
  const [activeDates, setActiveDates] = useState<string[]>([]);
  
  // Static marked dates from last activity
  const markedDates: Record<
    string,
    { selected: boolean; selectedColor: string; disableTouchEvent?: boolean }
  > = {
    '2025-01-25': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
    '2025-01-26': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
    '2025-01-27': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
    '2025-01-28': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
  };

  // Determine latest disabled date in the static markedDates
  const latestDisabledDate = Object.keys(markedDates).reduce(
    (max, date) => (date > max ? date : max),
    Object.keys(markedDates)[0]
  );

  // Fetch dates from Firestore where status is 'initialized'
  useEffect(() => {
    const fetchFirestoreDates = async () => {
      try {
        const db = getDatabase();
        const activitiesRef = ref(db, 'activities');
        const snapshot = await get(activitiesRef);
        const dates: string[] = [];
        snapshot.forEach((childSnapshot) => {
          const date = childSnapshot.key; // The key is the date
          if (childSnapshot.val().status === 'initialized') {
            dates.push(date);
          }
        });
        setActiveDates(dates);
      } catch (error) {
        console.error("Error fetching Firestore dates:", error);
      }
    };

    fetchFirestoreDates();
  }, []);

  const handleDayPress = (day: DateData) => {
    // Prevent toggling for static disabled dates or dates before the latest disabled date
    if (
      markedDates[day.dateString]?.disableTouchEvent ||
      day.dateString < latestDisabledDate
    ) {
      return;
    }

    // Toggle the date in activeDates
    if (activeDates.includes(day.dateString)) {
      setActiveDates(activeDates.filter(date => date !== day.dateString));
    } else {
      setActiveDates([...activeDates, day.dateString]);
    }
  };

  const handleSave = () => {
    onSave(activeDates);
  };

  return (
    <View>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          ...activeDates.reduce((acc, date) => {
            acc[date] = { selected: true, selectedColor: "green", marked: true };
            return acc;
          }, {} as Record<string, { selected: boolean; selectedColor: string; marked: boolean }>),
        }}
      />
      <View style={{ marginTop: 20 }}>
        <Button title="Save" onPress={handleSave} />
      </View>
    </View>
  );
};

export default CustomCalendar;