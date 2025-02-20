import React, { FC, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { View, Button } from "react-native";

// interface CalendarProps {
//   // selectedDates and setSelectedDates removed from props; we're using local state
// }
type CalendarProps = {
  selectedDay: string | null;
  setSelectedDay: React.Dispatch<React.SetStateAction<string | null>>;
  // other props
};
const CustomCalendar: FC<CalendarProps> = () => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Mark the dates from the last activity as grey and disable interaction
  const markedDates: Record<
    string,
    { selected: boolean; selectedColor: string; disableTouchEvent?: boolean }
  > = {
    '2025-01-25': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
    '2025-01-26': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
    '2025-01-27': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
    '2025-01-28': { selected: true, selectedColor: 'grey', disableTouchEvent: true },
  };

  // Determine latest disabled date in the record
  const latestDisabledDate = Object.keys(markedDates).reduce(
    (max, date) => (date > max ? date : max),
    Object.keys(markedDates)[0]
  );

  const handleDayPress = (day: DateData) => {
    if (markedDates[day.dateString]?.disableTouchEvent || day.dateString < latestDisabledDate) {
      return;
    }

    if (selectedDates.includes(day.dateString)) {
      setSelectedDates(selectedDates.filter((date) => date !== day.dateString));
    } else {
      setSelectedDates([...selectedDates, day.dateString]);
    }
  };

  const handleSave = () => {
    // Now simply console.log the selectedDays
    console.log("Selected Days:", selectedDates);
  };

  return (
    <View>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          ...selectedDates.reduce((acc, date) => {
            acc[date] = { selected: true, selectedColor: 'green', marked: true };
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