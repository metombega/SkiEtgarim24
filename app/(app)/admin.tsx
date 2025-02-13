import React, { useState } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { useRouter } from "expo-router";
import CustomCalendar from '@/components/CustomCalendar';
import CustomButton from '@/components/CustomButton';
import { Colors } from '../config/constants/constants';

export default function Admin() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>לוח פעילויות</Text>
        <CustomCalendar setSelectedDay={setSelectedDay} />
        <Button
          title="צור לוח פעילויות לעונה הבאה"
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>בסיס נתונים</Text>
        <CustomButton
          title="מתנדבים"
          description="ניהול מתנדבים"
          imageSource={require('@/assets/images/react-logo.png')}
          onPress={() => router.push('/admin')}
        />
        <CustomButton
          title="גולשים"
          description="ניהול גולשים"
          imageSource={require('@/assets/images/react-logo.png')}
          onPress={() => router.push('/admin')}
        />
        <CustomButton
          title="ציוד"
          description="ניהול ציוד"
          imageSource={require('@/assets/images/react-logo.png')}
          onPress={() => router.push('/admin')}
        />
        <CustomButton
          title="דוחות"
          description="צפייה בדוחות"
          imageSource={require('@/assets/images/react-logo.png')}
          onPress={() => router.push('/admin')}
        />
        <CustomButton
          title="שיבוצי מתנדבים"
          description="ניהול שיבוצים"
          imageSource={require('@/assets/images/react-logo.png')}
          onPress={() => router.push('/admin')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 20,
    },
});

