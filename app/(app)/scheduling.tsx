import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import CustomSchedulingCalendar from "../../components/CustomSchedulingCalendar";
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
import { autoSchedule } from "../../helpers/AutoSchedule";

export default function Scheduling() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [step1Completed, setStep1Completed] = useState(false);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [signedVolunteers, setSignedVolunteers] = useState(0);
  const [step2Completed, setStep2Completed] = useState(false);

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

  // Function to allow editing step 1
  const handleEditStep1 = () => {
    setStep1Completed(false);
    AsyncStorage.setItem("step1Completed", "false");
  };

  const handleEditStep2 = () => {
    setStep2Completed(false);
    AsyncStorage.setItem("step2Completed", "false");
  };

  // Handler for auto schedule button click in Step 2
  const handleCreateAutoSchedule = () => {
    const markStep2Completed = () => {
      autoSchedule();
      setStep2Completed(true);
      AsyncStorage.setItem("step2Completed", "true");
    };

    if (signedVolunteers < totalVolunteers) {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          "Not all volunteers signed in. Are you sure you want to continue?"
        );
        if (confirmed) {
          markStep2Completed();
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
      markStep2Completed();
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
    <View style={{ padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
          paddingBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => scrollToSection("step1")}>
          <Text>Step 1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToSection("step2")}>
          <Text>Step 2</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToSection("step3")}>
          <Text>Step 3</Text>
        </TouchableOpacity>
      </View>

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
          <TouchableOpacity onPress={handleEditStep1}>
            <Text style={{ color: "blue", textDecorationLine: "underline" }}>
              Edit Step 1
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2 with volunteer progress bar and auto schedule button */}

      <View ref={step2Ref} style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>
          {step2Completed ? "Step 2 Completed" : "Step 2"}
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
        {!step2Completed ? (
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
              Create Auto Schedule
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ marginBottom: 40 }}>
            <TouchableOpacity onPress={handleEditStep2}>
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Edit Step 2
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View ref={step3Ref} style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Step 3</Text>
        <Text>Step 3 Content</Text>
      </View>
    </View>
  );

  // Helper function to scroll to section
  function scrollToSection(section: "step1" | "step2" | "step3") {
    let refToScroll;
    if (section === "step1") {
      refToScroll = step1Ref?.current;
    } else if (section === "step2") {
      refToScroll = step2Ref?.current;
    } else {
      refToScroll = step3Ref?.current;
    }
    // @ts-ignore
    refToScroll?.scrollIntoView({ behavior: "smooth" });
  }
}
