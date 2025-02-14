import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import firebase from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database";

// Initialize Firebase (use your own config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const SurfersManagement = () => {
  const [surfers, setSurfers] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredSurfers, setFilteredSurfers] = useState([]);

  useEffect(() => {
    const fetchSurfers = async () => {
      const surfersRef = firebase.database().ref('surfers');
      surfersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const surfersList = Object.values(data).sort((a, b) => a.name.localeCompare(b.name));
        setSurfers(surfersList);
        setFilteredSurfers(surfersList);
      });
    };

    fetchSurfers();
  }, []);

  useEffect(() => {
    setFilteredSurfers(
      surfers.filter(surfer => surfer.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, surfers]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Surfers"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredSurfers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.surferItem}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  surferItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
});

export default SurfersManagement;