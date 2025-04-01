import { Calendar, DateData } from "react-native-calendars";
import { FC, useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../app/(app)/navigationTypes";

interface CalendarProps {
  selectedDay?: string | null;
  setSelectedDay: (day: string | null) => void;
}

const CustomCalendar: FC<CalendarProps> = ({ setSelectedDay, selectedDay }) => {
  const [markedDates, setMarkedDates] = useState<
    Record<string, { selected: boolean; selectedColor: string }>
  >({});

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "activity_day">>();

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
    const selectedColor = markedDates[day.dateString]?.selectedColor;

    if (selectedColor) {
      setSelectedDay(day.dateString);

      // Navigate to the activity_day page with the selected date
      navigation.navigate("activity_day", { date: day.dateString });
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
