import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { getDatabase, ref, get, set } from "firebase/database";
import { analyzeSchedule } from "../helpers/AutoSchedule";

type Schedule = {
  roles: Record<string, string[]>;
  workers: string[];
  replaceableWorkers: string[];
  expertises: Record<string, number>;
};

type VolunteerAssignments = Record<
  string,
  Record<string, "white" | "yellow" | "green">
>;

interface AssignedVolunteersProps {
  onSave: () => void;
  schedule: Record<string, Schedule>;
}

const AssignedVolunteers: React.FC<AssignedVolunteersProps> = ({
  onSave,
  schedule,
}) => {
  const [assignments, setAssignments] = useState<VolunteerAssignments>({});
  const [originalAssignments, setOriginalAssignments] =
    useState<VolunteerAssignments>({});
  const [dates, setDates] = useState<string[]>([]);
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [issues, setIssues] = useState<string[]>([]); // State to store schedule issues
  const [scheduleState, setSchedule] = useState(schedule);

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

        // Fetch assigned volunteers
        const assignedVolunteers = fetchedData[date].volunteers
          ? (Object.values(fetchedData[date].volunteers) as string[])
          : [];

        // Fetch available volunteers
        const availableVolunteers = Array.isArray(
          fetchedData[date].availableVolunteers
        )
          ? (fetchedData[date].availableVolunteers as string[])
          : [];

        // Process volunteers
        for (const volunteer of availableVolunteers) {
          newVolunteers.add(volunteer);
          if (!newAssignments[volunteer]) {
            newAssignments[volunteer] = {};
          }
          newAssignments[volunteer][date] = assignedVolunteers.includes(
            volunteer
          )
            ? "green" // Mark as green if assigned
            : "yellow"; // Mark as yellow if only available
        }

        for (const volunteer of assignedVolunteers) {
          newVolunteers.add(volunteer);
          if (!newAssignments[volunteer]) {
            newAssignments[volunteer] = {};
          }
          if (!availableVolunteers.includes(volunteer)) {
            newAssignments[volunteer][date] = "green";
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

  useEffect(() => {
    const fetchIssues = async () => {
      // print schedule
      console.log("Schedule:", schedule);
      const issues = await analyzeSchedule(schedule);
      setIssues(issues);
    };

    if (schedule) {
      fetchIssues();
    }
  }, [schedule]);

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

    // Update the schedule dynamically
    const updatedSchedule = { ...scheduleState };
    if (newColor === "green") {
      // Add volunteer to workers list
      if (!updatedSchedule[date].workers.includes(volunteer)) {
        updatedSchedule[date].workers.push(volunteer);
      }
    } else {
      // Remove volunteer from workers list
      updatedSchedule[date].workers = updatedSchedule[date].workers.filter(
        (worker) => worker !== volunteer
      );
    }
    setSchedule(updatedSchedule);

    // Recalculate issues
    analyzeSchedule(updatedSchedule).then((newIssues) => setIssues(newIssues));
  };

  const handleSave = async () => {
    if (issues.length > 0) {
      const issuesMessage = issues.join("\n");

      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          `The following issues were found:\n\n${issuesMessage}\n\nAre you sure you want to proceed?`
        );
        if (!confirmed) {
          return; // Exit if the user cancels
        }
      } else {
        const userResponse = await new Promise((resolve) => {
          Alert.alert(
            "Schedule Issues",
            `The following issues were found:\n\n${issuesMessage}\n\nAre you sure you want to proceed?`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
              },
              { text: "OK", onPress: () => resolve(true) },
            ]
          );
        });

        if (!userResponse) {
          return; // Exit if the user cancels
        }
      }
    }

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

    // Reset the schedule to match the original assignments
    const resetSchedule = { ...scheduleState };
    dates.forEach((date) => {
      resetSchedule[date].workers = volunteers.filter(
        (volunteer) => originalAssignments[volunteer][date] === "green"
      );
    });
    setSchedule(resetSchedule);

    // Recalculate issues
    analyzeSchedule(resetSchedule).then((newIssues) => setIssues(newIssues));
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
        {issues.length > 0 && (
          <View style={styles.issuesContainer}>
            <Text style={styles.issuesTitle}>Schedule Issues:</Text>
            {issues.map((issue, index) => (
              <Text key={index} style={styles.issue}>
                - {issue}
              </Text>
            ))}
          </View>
        )}
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
  issuesContainer: {
    marginTop: 20,
  },
  issuesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  issue: {
    color: "red",
    marginBottom: 5,
  },
});

export default AssignedVolunteers;
