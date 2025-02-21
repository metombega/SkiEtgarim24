import React, { FC, useEffect, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { View, Button } from "react-native";
import { getDatabase, ref, get, set } from "firebase/database";

type CalendarProps = {
  selectedDay: string | null;
  setSelectedDay: React.Dispatch<React.SetStateAction<string | null>>;
  onSave: (selectedDates: string[]) => void;
  scheduledDates: string[];
};

const CustomCalendar: FC<CalendarProps> = ({ onSave }) => {
  // State for active (toggled) dates
  const [activeDates, setActiveDates] = useState<string[]>([]);
  // State for disabled dates fetched from Firebase (status !== "initialized")
  const [disabledDates, setDisabledDates] = useState<string[]>([]);

  // Fetch disabled dates from Firebase (activities with status not equal to 'initialized')
  useEffect(() => {
    const fetchDisabledDates = async () => {
      try {
        const db = getDatabase();
        const activitiesRef = ref(db, "activities");
        const snapshot = await get(activitiesRef);
        const disabled: string[] = [];
        const active: string[] = [];
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.val().status !== "initialized") {
            disabled.push(childSnapshot.key as string);
          } else {
            active.push(childSnapshot.key as string);
          }
        });
        setDisabledDates(disabled);
        setActiveDates(active);
      } catch (error) {
        console.error("Error fetching disabled dates:", error);
      }
    };

    fetchDisabledDates();
  }, []);

  // Optionally, if you still need to fetch dates for active selection,
  // you can use a separate or combined Firebase query.
  // For now, we keep the activeDates state as user interaction only.

  // Determine the latest disabled date (if any)
  const latestDisabledDate =
    disabledDates.length > 0
      ? disabledDates.reduce((max, date) => (date > max ? date : max))
      : null;

  const handleDayPress = (day: DateData) => {
    // Prevent toggling for disabled dates or dates before the latest disabled date
    if (
      disabledDates.includes(day.dateString) ||
      (latestDisabledDate && day.dateString < latestDisabledDate)
    ) {
      return;
    }

    // Toggle the date in activeDates
    if (activeDates.includes(day.dateString)) {
      setActiveDates(activeDates.filter((date) => date !== day.dateString));
    } else {
      setActiveDates([...activeDates, day.dateString]);
    }
  };

  // Combine disabled dates and active dates for calendar marking
  const markedDates = {
    ...disabledDates.reduce((acc, date) => {
      acc[date] = {
        selected: true,
        selectedColor: "grey",
        disableTouchEvent: true,
      };
      return acc;
    }, {} as Record<string, { selected: boolean; selectedColor: string; disableTouchEvent: boolean }>),
    ...activeDates.reduce((acc, date) => {
      acc[date] = { selected: true, selectedColor: "green", marked: true };
      return acc;
    }, {} as Record<string, { selected: boolean; selectedColor: string; marked: boolean }>),
  };

  const handleSave = () => {
    onSave(activeDates);
  };

  return (
    <View>
      <Calendar onDayPress={handleDayPress} markedDates={markedDates} />
      <View style={{ marginTop: 20 }}>
        <Button title="Save" onPress={handleSave} />
      </View>
    </View>
  );
};

export default CustomCalendar;
