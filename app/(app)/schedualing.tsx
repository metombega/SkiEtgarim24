import React, { useState } from 'react';
import CustomSchedualingCalendar from '../../components/CustomSchedualingCalendar';

export default function Schedualing() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <a href="#step1" style={{ marginRight: '10px' }}>Step 1</a>
        <a href="#step2" style={{ marginRight: '10px' }}>Step 2</a>
        <a href="#step3">Step 3</a>
      </nav>

      <section id="step1" style={{ marginBottom: '40px' }}>
        <h2>שלב ראשון: קבע תאריכים לתקופה הקרובה</h2>
        <CustomSchedualingCalendar selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
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