import React, { FC, useEffect, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { View, Button } from "react-native";
import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";

type CalendarProps = {
  selectedDay: string | null;
  setSelectedDay: React.Dispatch<React.SetStateAction<string | null>>;
  onSave: (selectedDates: string[]) => void;
};

const CustomCalendar: FC<CalendarProps> = ({ onSave }) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [firestoreDates, setFirestoreDates] = useState<string[]>([]);
  
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
        setFirestoreDates(dates);
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

    // If the day is marked either by a firestore date or a user-selected date, remove it  
    if (selectedDates.includes(day.dateString) || firestoreDates.includes(day.dateString)) {
      setSelectedDates(selectedDates.filter(date => date !== day.dateString));
      setFirestoreDates(firestoreDates.filter(date => date !== day.dateString));
    } else {
      setSelectedDates([...selectedDates, day.dateString]);
    }
  };

  const handleSave = () => {
    onSave(selectedDates);
  };

  return (
    <View>
      <Calendar
      onDayPress={handleDayPress}
      markedDates={{
        ...markedDates,
        // Mark dates fetched from Firestore as green and enable touches
        ...firestoreDates.reduce((acc, date) => {
        acc[date] = { selected: true, selectedColor: "green", marked: true };
        return acc;
        }, {} as Record<string, { selected: boolean; selectedColor: string; marked: boolean }>),
        // Mark dates that the user selected as green
        ...selectedDates.reduce((acc, date) => {
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