import { Calendar, DateData } from "react-native-calendars";
import { FC } from "react";

interface CalendarProps {
  selectedDay?: string | null;
  setSelectedDay: (day: string | null) => void;
}

const CustomCalendar: FC<CalendarProps> = ({ setSelectedDay, selectedDay }) => {
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

  // Determine latest date in the record
  const latestDisabledDate = Object.keys(markedDates).reduce((max, date) => date > max ? date : max, Object.keys(markedDates)[0]);

  const handleDayPress = (day: DateData) => {
    // Disable selection if the date is marked as disabled (grey)
    if (markedDates[day.dateString]?.disableTouchEvent) {
      return;
    }
    // Disable interaction if the date is before the latestDisabledDate
    if (day.dateString < latestDisabledDate) {
      return;
    }
    // Toggle selection if the same day is clicked again
    if (selectedDay === day.dateString) {
      setSelectedDay(null);
      return;
    }
    setSelectedDay(day.dateString);
  };

  return (
    <Calendar
      onDayPress={handleDayPress}
      markedDates={{
        ...markedDates,
        ...(selectedDay ? { [selectedDay]: { selected: true, selectedColor: 'green', marked: true } } : {}),
      }}
    />
  );
};

export default CustomCalendar;