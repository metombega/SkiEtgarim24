import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useRouter } from "expo-router";
import CustomCalendar from '@/components/CustomCalendar';

export default function Surfer() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

    return (
      <View style={styles.container}>
        <CustomCalendar setSelectedDay={setSelectedDay}/>
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
  