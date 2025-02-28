import React, { FC, useState, useEffect } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { View, Button } from "react-native";
import { getDatabase, ref, get } from "firebase/database";

type CalendarProps = {
  selectedDay: string | null;
  setSelectedDay: React.Dispatch<React.SetStateAction<string | null>>;
  onSave: (selectedDates: string[]) => void;
  scheduledDates: string[];
};

const CustomCalendar: FC<CalendarProps> = ({ scheduledDates, onSave }) => {
  // Store dates that are allowed to be toggled
  const [initializedDates, setInitializedDates] = useState<string[]>([]);
  // State mapping for the date color: "orange" or "green"
  const [dateColors, setDateColors] = useState<Record<string, string>>({});

  // Fetch initialized activities from the database on mount (or when scheduledDates updates)
  useEffect(() => {
    const fetchActivities = async () => {
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
      setInitializedDates(active);
      // Create a color mapping: mark dates found in scheduledDates as green, otherwise default to orange.
      const initialColors: Record<string, string> = {};
      active.forEach((date) => {
        initialColors[date] = scheduledDates.includes(date)
          ? "green"
          : "orange";
      });
      setDateColors(initialColors);
    };

    fetchActivities();
  }, [scheduledDates]);

  const handleDayPress = (day: DateData) => {
    // Only allow toggling if the date was initialized
    if (!initializedDates.includes(day.dateString)) {
      return;
    }
    // Toggle the color between orange and green
    setDateColors((prevColors) => {
      const currentColor = prevColors[day.dateString];
      const newColor = currentColor === "orange" ? "green" : "orange";
      return { ...prevColors, [day.dateString]: newColor };
    });
  };

  // Mark the dates based on the current color mapping
  const markedDates = Object.keys(dateColors).reduce((acc, date) => {
    acc[date] = {
      selected: true,
      selectedColor: dateColors[date],
      marked: true,
    };
    return acc;
  }, {} as Record<string, { selected: boolean; selectedColor: string; marked: boolean }>);

  const handleSave = () => {
    // Filter the dates to only include those with "green" as the color
    const selectedGreenDates = Object.keys(dateColors).filter(
      (date) => dateColors[date] === "green"
    );
    onSave(selectedGreenDates);
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
