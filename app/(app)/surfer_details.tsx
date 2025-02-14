import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { get, getDatabase, ref } from "firebase/database";
import { useLocalSearchParams } from 'expo-router';


interface Surfer {
  age: string;
  email: string;
  // Add more fields as needed
}

const SurferDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [surfer, setSurfer] = useState<Surfer | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchSurfer = async () => {
      const db = getDatabase();
      const surferRef = ref(db, `users/surfers/${id}`);
      const snapshot = await get(surferRef);
      setSurfer(snapshot.val());
    };

    fetchSurfer();
  }, [id]);

  if (!surfer) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Age: {surfer.age}</Text>
      <Text style={styles.label}>Email: {surfer.email}</Text>
      {/* Add more fields as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default SurferDetails;