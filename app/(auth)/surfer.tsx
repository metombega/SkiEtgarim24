import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from "expo-router";

export default function Surfer() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
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
      <View style={styles.container}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            ...(selectedDay ? { [selectedDay]: { selected: true, selectedColor: 'green', marked: true } } : {}),
          }}
        />
        <Button
          title="Sign To Selected Day"
          onPress={() => alert(`Signed up for ${selectedDay}`)}
          disabled={!selectedDay}
        />
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
  });
  