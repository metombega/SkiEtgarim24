import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";

type VolunteerAssignments = Record<
  string,
  Record<string, "red" | "yellow" | "green">
>;

const AssignedVolunteers: React.FC = () => {
  const [assignments, setAssignments] = useState<VolunteerAssignments>({});
  const [dates, setDates] = useState<string[]>([]);
  const [volunteers, setVolunteers] = useState<string[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      const db = getDatabase();
      const activitiesRef = ref(db, "activities");
      const snapshot = await get(activitiesRef);
      if (!snapshot.exists()) {
        throw new Error("No activity data available in Firebase");
      }
      const fetchedData = snapshot.val();
      const newAssignments: VolunteerAssignments = {};
      const newDates: string[] = [];
      const newVolunteers: Set<string> = new Set();

      for (const date in fetchedData) {
        newDates.push(date);
        const assignedVolunteers = fetchedData[date].volunteers || [];
        const availableVolunteers = fetchedData[date].availableVolunteers || [];
        for (const volunteer of availableVolunteers) {
          newVolunteers.add(volunteer);
          if (!newAssignments[volunteer]) {
            newAssignments[volunteer] = {};
          }
          newAssignments[volunteer][date] = assignedVolunteers.includes(
            volunteer
          )
            ? "green"
            : "yellow";
        }
        for (const volunteer of assignedVolunteers) {
          newVolunteers.add(volunteer);
          if (!newAssignments[volunteer]) {
            newAssignments[volunteer] = {};
          }
          if (!availableVolunteers.includes(volunteer)) {
            newAssignments[volunteer][date] = "red";
          }
        }
      }

      setAssignments(newAssignments);
      setDates(newDates);
      setVolunteers(Array.from(newVolunteers));
    };

    fetchAssignments();
  }, []);

  return (
    <div>
      <h1>Volunteer Assignments</h1>
      <table>
        <thead>
          <tr>
            <th>Volunteer</th>
            {dates.map((date) => (
              <th key={date}>{date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {volunteers.map((volunteer) => (
            <tr key={volunteer}>
              <td>{volunteer}</td>
              {dates.map((date) => (
                <td
                  key={date}
                  style={{
                    backgroundColor: assignments[volunteer]?.[date] || "white",
                  }}
                >
                  {assignments[volunteer]?.[date] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedVolunteers;
