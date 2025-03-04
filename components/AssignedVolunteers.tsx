import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getDatabase, ref, get, set } from "firebase/database";

type VolunteerAssignments = Record<
  string,
  Record<string, "white" | "yellow" | "green">
>;

interface AssignedVolunteersProps {
  onSave: () => void;
}

const AssignedVolunteers: React.FC<AssignedVolunteersProps> = ({ onSave }) => {
  const [assignments, setAssignments] = useState<VolunteerAssignments>({});
  const [originalAssignments, setOriginalAssignments] =
    useState<VolunteerAssignments>({});
  const [dates, setDates] = useState<string[]>([]);
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
        if (fetchedData[date].status !== "initialized") continue;
        newDates.push(date);
        const assignedVolunteers = Array.isArray(fetchedData[date].volunteers)
          ? fetchedData[date].volunteers
          : [];
        const availableVolunteers = Array.isArray(
          fetchedData[date].availableVolunteers
        )
          ? fetchedData[date].availableVolunteers
          : [];
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
            newAssignments[volunteer][date] = "white";
          }
        }
      }

      setAssignments(newAssignments);
      setOriginalAssignments(newAssignments);
      setDates(newDates);
      setVolunteers(Array.from(newVolunteers));
    };

    fetchAssignments();
  }, []);

  const handleCellClick = (volunteer: string, date: string) => {
    if (!isEditing) return;

    const currentColor = assignments[volunteer][date];
    const newColor =
      currentColor === "yellow"
        ? "green"
        : currentColor === "green"
        ? "white"
        : "yellow";

    const updatedAssignments: VolunteerAssignments = {
      ...assignments,
      [volunteer]: {
        ...assignments[volunteer],
        [date]: newColor as "white" | "yellow" | "green",
      },
    };

    setAssignments(updatedAssignments);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    const db = getDatabase();
    dates.forEach((date) => {
      const volunteersForDate: string[] = [];
      const availableVolunteersForDate: string[] = [];

      volunteers.forEach((volunteer) => {
        if (assignments[volunteer][date] === "green") {
          volunteersForDate.push(volunteer);
          availableVolunteersForDate.push(volunteer);
        } else if (assignments[volunteer][date] === "yellow") {
          availableVolunteersForDate.push(volunteer);
        }
      });

      const volunteerRef = ref(db, `activities/${date}/volunteers`);
      set(volunteerRef, volunteersForDate);

      const availableVolunteerRef = ref(
        db,
        `activities/${date}/availableVolunteers`
      );
      set(availableVolunteerRef, availableVolunteersForDate);

      const statusRef = ref(db, `activities/${date}/status`);
      set(statusRef, "volunteers_assigned");
    });
    setOriginalAssignments(assignments);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    onSave(); // Call the onSave callback
  };

  const handleReset = () => {
    setAssignments(originalAssignments);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Volunteer Assignments</Text>
        <Button
          title={isEditing ? "Reset to Original" : "Edit Assignments"}
          onPress={() => {
            if (isEditing) {
              handleReset();
            } else {
              setIsEditing(true);
            }
          }}
        />
        <ScrollView horizontal>
          <View>
            <View style={styles.row}>
              <Text style={styles.headerCell}>Volunteer</Text>
              {dates.map((date) => (
                <Text key={date} style={styles.headerCell}>
                  {date}
                </Text>
              ))}
            </View>
            {volunteers.map((volunteer) => (
              <View key={volunteer} style={styles.row}>
                <Text style={styles.cell}>{volunteer}</Text>
                {dates.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.cell,
                      {
                        backgroundColor:
                          assignments[volunteer]?.[date] || "white",
                      },
                    ]}
                    onPress={() => handleCellClick(volunteer, date)}
                  ></TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
        <Button
          title="Save Changes and message to volunteers"
          onPress={handleSave}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCell: {
    fontWeight: "bold",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    flex: 1,
    textAlign: "center",
  },
  cell: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    flex: 1,
    textAlign: "center",
  },
});

export default AssignedVolunteers;
