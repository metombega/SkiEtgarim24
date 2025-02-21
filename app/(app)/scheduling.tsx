import React, { useState, useEffect } from 'react';
import CustomSchedulingCalendar from '../../components/CustomSchedulingCalendar';
import {
  getDatabase,
  ref,
  set,
  query,
  orderByChild,
  equalTo,
  get as firebaseGet
} from "firebase/database";

export default function Scheduling() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);

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
  };

  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <a href="#step1" style={{ marginRight: '10px' }}>Step 1</a>
        <a href="#step2" style={{ marginRight: '10px' }}>Step 2</a>
        <a href="#step3">Step 3</a>
      </nav>

      <section id="step1" style={{ marginBottom: '40px' }}>
        <h2>שלב ראשון: קבע תאריכים לתקופה הקרובה</h2>
        <CustomSchedulingCalendar 
          selectedDay={selectedDay} 
          setSelectedDay={setSelectedDay} 
          onSave={handleSave}
          scheduledDates={scheduledDates} // pass the fetched dates to the calendar
        />
      </section>

      <section id="step2" style={{ marginBottom: '40px' }}>
        <h2>Step 2</h2>
        <p>Step 2</p>
      </section>

      <section id="step3" style={{ marginBottom: '40px' }}>
        <h2>Step 3</h2>
        <p>Step 3</p>
      </section>
    </div>
  );
}