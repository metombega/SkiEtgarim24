import { Calendar, DateData } from "react-native-calendars";
import { FC, useState } from "react";


interface CalendarProps {
    selectedDay?: string | null;
    setSelectedDay: (day: string | null) => void;
}

const CustomCalendar: FC<CalendarProps> = ({setSelectedDay, selectedDay}) => {
    
    // Define marked dates
    const markedDates: Record<string, { selected: boolean; selectedColor: string }> = {
        '2025-01-25': { selected: true, selectedColor: 'green' }, // Selectable
        '2025-01-26': { selected: true, selectedColor: 'red' },   // Taken
        '2025-01-27': { selected: true, selectedColor: 'black' }, // Unavailable
        '2025-01-28': { selected: true, selectedColor: 'blue' },  // Already signed
    };
    
    const handleDayPress = (day: DateData) => {
        if (markedDates[day.dateString]?.selectedColor === 'green') {
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
            ...(selectedDay ? { [selectedDay]: { selected: true, selectedColor: 'green', marked: true } } : {}),
            }}
        />
    );
}

export default CustomCalendar;