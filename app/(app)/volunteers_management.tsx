import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { get, getDatabase, ref, remove } from "firebase/database";
import { Pencil, Trash } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { VolunteerDetailsNavigationProp } from "./navigationTypes";

const VolunteersManagement = () => {
  const navigation = useNavigation<VolunteerDetailsNavigationProp>();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filteredVolunteers, setFilteredVolunteers] = useState<any[]>([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      const db = getDatabase();
      const volunteersRef = ref(db, "users/ski-team/");
      const snapshot = await get(volunteersRef);
      const volunteersList = snapshot.val();
      const volunteersArray = Object.keys(volunteersList).map((key) => ({
        id: key,
        ...volunteersList[key],
      }));
      setVolunteers(volunteersArray);
    };

    fetchVolunteers();
  }, []);

  useEffect(() => {
    setFilteredVolunteers(
      volunteers.filter((volunteer) =>
        volunteer.fullName?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, volunteers]);

  const handleEdit = (id: string) => {
    navigation.navigate("volunteer_details", { id });
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this volunteer?"
      );
      if (!confirmed) return;

      const db = getDatabase();
      const volunteerRef = ref(db, `users/ski-team/${id}`);
      remove(volunteerRef);
      setVolunteers(volunteers.filter((volunteer) => volunteer.id !== id));
    } else {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this volunteer?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              const db = getDatabase();
              const volunteerRef = ref(db, `users/ski-team/${id}`);
              await remove(volunteerRef);
              setVolunteers(
                volunteers.filter((volunteer) => volunteer.id !== id)
              );
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Volunteers"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredVolunteers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.volunteerItem}>
            <Text>{item.fullName}</Text>
            <View style={styles.icons}>
              <TouchableOpacity onPress={() => handleEdit(item.id)}>
                <Pencil size={20} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Trash size={20} color="red" />
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
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  volunteerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  icons: {
    flexDirection: "row",
    width: 50,
    justifyContent: "space-between",
  },
});

export default VolunteersManagement;
