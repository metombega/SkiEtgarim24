import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import { ActivityDayRouteProp } from "./navigationTypes";
import { useRoute } from "@react-navigation/native";
import { getDatabase, ref, onValue, update } from "firebase/database";

const ActivityDay = () => {
  const route = useRoute<ActivityDayRouteProp>();
  const { date } = route.params;

  const [activityDetails, setActivityDetails] = useState<
    string | Record<string, any> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [editedDetails, setEditedDetails] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode

  useEffect(() => {
    const db = getDatabase();
    const activityRef = ref(db, `activities/${date}`);

    const unsubscribe = onValue(activityRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setActivityDetails(data);
        setEditedDetails(data); // Initialize editable details
      } else {
        setActivityDetails("No activity found for this date.");
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [date]);

  const handleInputChange = (key: string, value: string | string[]) => {
    setEditedDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const db = getDatabase();
    const activityRef = ref(db, `activities/${date}`);
    update(activityRef, editedDetails)
      .then(() => {
        alert("Details updated successfully!");
        setIsEditing(false); // Exit edit mode after saving
      })
      .catch((error) => alert(`Error updating details: ${error.message}`));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity for {date}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : typeof activityDetails === "string" ? (
        <Text style={styles.details}>{activityDetails}</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.detailsContainer}>
            <Button
              title={isEditing ? "Cancel" : "Edit"}
              onPress={() => setIsEditing(!isEditing)} // Toggle edit mode
            />
            {Object.entries(editedDetails).map(([key, value]) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{key}:</Text>
                {Array.isArray(value) ? (
                  value.map((item, index) => (
                    <TextInput
                      key={`${key}-${index}`}
                      style={styles.input}
                      value={String(item)}
                      editable={isEditing} // Make editable only in edit mode
                      onChangeText={(text) => {
                        const updatedArray = [...value];
                        updatedArray[index] = text;
                        handleInputChange(key, updatedArray);
                      }}
                    />
                  ))
                ) : (
                  <TextInput
                    style={styles.input}
                    value={String(value)}
                    editable={isEditing} // Make editable only in edit mode
                    onChangeText={(text) => handleInputChange(key, text)}
                  />
                )}
              </View>
            ))}
            {isEditing && <Button title="Save" onPress={handleSave} />}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  details: {
    fontSize: 16,
    textAlign: "center",
  },
  detailsContainer: {
    width: "100%",
    padding: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  scrollContainer: {
    width: "100%",
  },
});

export default ActivityDay;
