import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import CustomSchedulingCalendar from "../../components/CustomSchedulingCalendar";
import AssignedVolunteers from "../../components/AssignedVolunteers";
import {
  getDatabase,
  ref,
  set,
  remove,
  query,
  orderByChild,
  equalTo,
  get as firebaseGet,
} from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../config/constants/constants";
import {
  autoSchedule,
  analyzeSchedule,
  fetchWorkersFromFirebase,
  fetchDateToWorkersFromFirebase,
} from "../../helpers/AutoSchedule";
import { useRouter } from "expo-router";

export default function Scheduling() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [step1Completed, setStep1Completed] = useState(false);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [signedVolunteers, setSignedVolunteers] = useState(0);
  const [step2Completed, setStep2Completed] = useState(false);
  const [scheduleCreated, setScheduleCreated] = useState(false); // New state to track if the schedule is created
  const [schedule, setSchedule] = useState<Record<string, any>>({}); // State to store the schedule

  // Define refs for each step
  const step1Ref = useRef<View>(null);
  const step2Ref = useRef<View>(null);
  const step3Ref = useRef<View>(null);

  // Load step1Completed flag from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem("step1Completed").then((value) => {
      if (value === "true") {
        setStep1Completed(true);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("step2Completed").then((value) => {
      if (value === "true") {
        setStep2Completed(true);
      }
    });
  }, []);

  // Fetch volunteer signed status for ski-team
  useEffect(() => {
    const db = getDatabase();
    const skiTeamRef = ref(db, "users/ski-team");
    firebaseGet(skiTeamRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          let total = 0;
          let signed = 0;
          snapshot.forEach((childSnapshot) => {
            total += 1;
            const data = childSnapshot.val();
            if (data.signedForNextPeriod === true) {
              signed += 1;
            }
          });
          setTotalVolunteers(total);
          setSignedVolunteers(signed);
        }
      })
      .catch((error) => {
        console.error("Error fetching ski-team data:", error);
      });
  }, []);

  // Fetch scheduled dates where status is "initialized" when the component mounts
  useEffect(() => {
    const db = getDatabase();
    const activitiesRef = ref(db, "activities/");
    const q = query(
      activitiesRef,
      orderByChild("status"),
      equalTo("initialized")
    );
    firebaseGet(q)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const dates: string[] = [];
          snapshot.forEach((childSnapshot) => {
            dates.push(childSnapshot.key || "");
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
        status: "initialized",
        skiType: "",
        surfer: "",
        numberOfAdditionalSurfers: 0,
        numberOfAdditionalGuests: 0,
        activityManager: "",
        volunteers: [],
        startTime: "",
        endTime: "",
        startReport: null,
        endReport: null,
        equipments: [],
        boat: null,
      });
    }

    // Update local state to reflect new selection
    setScheduledDates(selectedDates);

    // Mark step 1 as completed and persist the change
    setStep1Completed(true);
    AsyncStorage.setItem("step1Completed", "true");

    // Reset all volunteers' signedForNextPeriod flag to false
    try {
      const skiTeamRef = ref(db, "users/ski-team");
      const snapshot = await firebaseGet(skiTeamRef);
      if (snapshot.exists()) {
        const promises: any[] = [];
        snapshot.forEach((childSnapshot) => {
          const volunteerId = childSnapshot.key;
          if (volunteerId) {
            const volunteerFlagRef = ref(
              db,
              "users/ski-team/" + volunteerId + "/signedForNextPeriod"
            );
            promises.push(set(volunteerFlagRef, false));
          }
        });
        await Promise.all(promises);
      }
    } catch (error) {
      console.error(
        "Error resetting signedForNextPeriod for volunteers:",
        error
      );
    }
  };

  // Handler for auto schedule button click in Step 2
  const handleCreateAutoSchedule = async () => {
    const markStep2Completed = async () => {
      const workers = await fetchWorkersFromFirebase();
      const dateToWorkers = await fetchDateToWorkersFromFirebase();
      const generatedSchedule = await autoSchedule(workers, dateToWorkers);

      console.log("Generated Schedule:", generatedSchedule); // Debugging log

      // Update the schedule state
      setSchedule(generatedSchedule);

      const db = getDatabase();
      const promises = Object.keys(generatedSchedule).flatMap((date) => {
        const volunteersRef = ref(db, `activities/${date}/volunteers`);
        const rolesRef = ref(db, `activities/${date}/roles`);

        const volunteers = generatedSchedule[date].workers;
        const roles = generatedSchedule[date].roles;

        return [set(volunteersRef, volunteers), set(rolesRef, roles)];
      });

      await Promise.all(promises);

      setStep2Completed(true);
      setScheduleCreated(true); // Mark the schedule as created
      AsyncStorage.setItem("step2Completed", "true");
    };

    if (signedVolunteers < totalVolunteers) {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          "Not all volunteers signed in. Are you sure you want to continue?"
        );
        if (confirmed) {
          await markStep2Completed();
        }
      } else {
        Alert.alert(
          "Not all volunteers signed in",
          "Are you sure you want to continue?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "OK",
              onPress: markStep2Completed,
            },
          ]
        );
      }
    } else {
      await markStep2Completed();
    }
  };

  // Handler for completing Step 2
  const handleCompleteStep2 = async () => {
    setStep1Completed(false);
    setStep2Completed(false);
    AsyncStorage.setItem("step1Completed", "false");
    AsyncStorage.setItem("step2Completed", "false");

    if (Platform.OS === "web") {
      alert("All done. Back to admin page");
      router.push("/admin");
    } else {
      Alert.alert("All done", "Back to admin page", [
        {
          text: "OK",
          onPress: () => router.push("/admin"),
        },
      ]);
    }
  };

  // Calculate progress ratio
  const progressRatio =
    totalVolunteers > 0 ? signedVolunteers / totalVolunteers : 0;
  // Calculate dynamic button color from red (0%) to green (100%)
  const red = Math.floor(255 * (1 - progressRatio));
  const green = Math.floor(255 * progressRatio);
  const buttonColor = `rgb(${red}, ${green}, 0)`;

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* Conditional rendering of Step 1 */}
      {!step1Completed ? (
        <View ref={step1Ref} style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>Step 1</Text>
          <CustomSchedulingCalendar
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            onSave={handleSave}
            scheduledDates={scheduledDates}
          />
        </View>
      ) : (
        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>
            Step 1 Completed
          </Text>
        </View>
      )}

      {/* Step 2 with volunteer progress bar and auto schedule button */}
      {step1Completed && (
        <View ref={step2Ref} style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>
            Step 2: Auto Schedule
          </Text>
          {!step2Completed && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ marginBottom: 5 }}>
                {signedVolunteers} of {totalVolunteers} volunteers signed in
              </Text>
              <View
                style={{
                  height: 20,
                  backgroundColor: "#eee",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${progressRatio * 100}%`,
                    backgroundColor: Colors.black,
                  }}
                />
              </View>
            </View>
          )}
          {!scheduleCreated ? (
            <TouchableOpacity
              onPress={handleCreateAutoSchedule}
              style={{
                padding: 15,
                backgroundColor: buttonColor,
                borderRadius: 5,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Create Schedule
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              <AssignedVolunteers
                onSave={handleCompleteStep2}
                schedule={schedule}
              />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
