import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { get, getDatabase, ref } from "firebase/database";
import Icon from 'react-native-vector-icons/FontAwesome';

const SurfersManagement = () => {
  const [surfers, setSurfers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filteredSurfers, setFilteredSurfers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSurfers = async () => {
        const db = getDatabase();
        const surfersRef = ref(db, "users/surfers/");
        const snapshot = await get(surfersRef);
        const surfersList = snapshot.val();
        const surfersArray = Object.keys(surfersList).map(key => ({
            id: key,
            username: key,
            ...surfersList[key],
        }));
        setSurfers(surfersArray);
    };

    fetchSurfers();
  }, []);

  useEffect(() => {
    setFilteredSurfers(
      surfers.filter((surfer) =>
        surfer.username?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, surfers]);

  const handleEdit = (id: string) => {
    // Handle edit action
  };

  const handleDelete = (id: string) => {
    // Handle delete action
  };

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
            <Text>{item.username}</Text>
            <View style={styles.icons}>
              <TouchableOpacity onPress={() => handleEdit(item.id)}>
                <Icon name="edit" size={20} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Icon name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  icons: {
    flexDirection: 'row',
    width: 50,
    justifyContent: 'space-between',
  },
});

export default SurfersManagement;