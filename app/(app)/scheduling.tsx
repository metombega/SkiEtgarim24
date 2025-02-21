import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CustomSchedulingCalendar from '../../components/CustomSchedulingCalendar';
import {
  getDatabase,
  ref,
  set,
  remove,  // <-- Added remove import
  query,
  orderByChild,
  equalTo,
  get as firebaseGet,
} from "firebase/database";

export default function Scheduling() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);

  // Define refs for each step
  const step1Ref = useRef<View>(null);
  const step2Ref = useRef<View>(null);
  const step3Ref = useRef<View>(null);

  // Function to scroll to a specific section (for web, ensure scrollIntoView works)
  const scrollToSection = (section: 'step1' | 'step2' | 'step3') => {
    let refToScroll;
    if (section === 'step1') {
      refToScroll = step1Ref?.current;
    } else if (section === 'step2') {
      refToScroll = step2Ref?.current;
    } else {
      refToScroll = step3Ref?.current;
    }
    // If using web or a scroll view that supports scrolling, otherwise implement as needed.
    // @ts-ignore
    refToScroll?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch scheduled dates where status is "initialized" when the component mounts
  useEffect(() => {
    const db = getDatabase();
    const activitiesRef = ref(db, "activities/");
    const q = query(activitiesRef, orderByChild("status"), equalTo("initialized"));
    firebaseGet(q)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const dates: string[] = [];
          snapshot.forEach((childSnapshot) => {
            // Optionally, you can use childSnapshot.val().date if saved in the payload
            dates.push(childSnapshot.key || '');
          });
          setScheduledDates(dates);
        }
      })
      .catch((error) => {
        console.error("Error fetching scheduled dates:", error);
      });
  }, []);

  const handleSave = async (selectedDates: string[]) => {
    const db = getDatabase();

    // Remove dates that were previously saved but are not in the new selection
    for (const scheduledDate of scheduledDates) {
      if (!selectedDates.includes(scheduledDate)) {
        const activityDayRef = ref(db, "activities/" + scheduledDate);
        console.log("Removing date:", scheduledDate);
        await remove(activityDayRef);
      }
    }

    // Save new or re-save selected dates
    for (const selectedDate of selectedDates) {
      const activityDayRef = ref(db, "activities/" + selectedDate);
      await set(activityDayRef, {
        date: selectedDate,
        status: 'initialized',
        skiType: '',
        surfer: '',
        numberOfAdditionalSurfers: 0,
        numberOfAdditionalGuests: 0,
        activityManager: '',
        volunteers: [],
        startTime: '',
        endTime: '',
        startReport: null,
        endReport: null,
        equipments: [],
        boat: null,
      });
    }
    
    // Update local state to reflect new selection
    setScheduledDates(selectedDates);
  };

  return (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => scrollToSection('step1')}>
          <Text>Step 1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToSection('step2')}>
          <Text>Step 2</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToSection('step3')}>
          <Text>Step 3</Text>
        </TouchableOpacity>
      </View>

      <View ref={step1Ref} style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>שלב ראשון: קבע תאריכים לתקופה הקרובה</Text>
        <CustomSchedulingCalendar 
          selectedDay={selectedDay} 
          setSelectedDay={setSelectedDay} 
          onSave={handleSave}
          scheduledDates={scheduledDates} // pass the fetched dates to the calendar
        />
      </View>

      <View ref={step2Ref} style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Step 2</Text>
        <Text>Step 2 Content</Text>
      </View>

      <View ref={step3Ref} style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Step 3</Text>
        <Text>Step 3 Content</Text>
      </View>
    </View>
  );
}