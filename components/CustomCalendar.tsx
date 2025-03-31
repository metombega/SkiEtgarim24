import { Calendar, DateData } from "react-native-calendars";
import { FC, useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

interface CalendarProps {
  selectedDay?: string | null;
  setSelectedDay: (day: string | null) => void;
}

const CustomCalendar: FC<CalendarProps> = ({ setSelectedDay, selectedDay }) => {
  const [markedDates, setMarkedDates] = useState<
    Record<string, { selected: boolean; selectedColor: string }>
  >({});

  useEffect(() => {
    const db = getDatabase();
    const activitiesRef = ref(db, "activities");
    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedMarkedDates: Record<
          string,
          { selected: boolean; selectedColor: string }
        > = {};

        Object.keys(data).forEach((date) => {
          const status = data[date]?.status;
          let selectedColor = "";

          switch (status) {
            case "cancelled":
              selectedColor = "red";
              break;
            case "finished":
              selectedColor = "black";
              break;
            case "volunteers_assigned":
              selectedColor = "blue";
              break;
            default:
              break;
          }

          if (selectedColor) {
            updatedMarkedDates[date] = {
              selected: true,
              selectedColor,
            };
          }
        });

        setMarkedDates(updatedMarkedDates);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleDayPress = (day: DateData) => {
    if (markedDates[day.dateString]?.selectedColor === "green") {
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
                selected: true,
                selectedColor: "green",
                marked: true,
              },
            }
          : {}),
      }}
    />
  );
};

export default CustomCalendar;
