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
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { SurferDetailsNavigationProp } from "./navigationTypes";

const SurfersManagement = () => {
  const navigation = useNavigation<SurferDetailsNavigationProp>();
  const [surfers, setSurfers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filteredSurfers, setFilteredSurfers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSurfers = async () => {
      const db = getDatabase();
      const surfersRef = ref(db, "users/surfers/");
      const snapshot = await get(surfersRef);
      const surfersList = snapshot.val();
      const surfersArray = Object.keys(surfersList).map((key) => ({
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
    navigation.navigate("surfer_details", { id });
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this surfer?"
      );
      if (!confirmed) return;

      const db = getDatabase();
      const surferRef = ref(db, `users/surfers/${id}`);
      remove(surferRef);
      setSurfers(surfers.filter((surfer) => surfer.id !== id));
    } else {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this surfer?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              const db = getDatabase();
              const surferRef = ref(db, `users/surfers/${id}`);
              await remove(surferRef);
              setSurfers(surfers.filter((surfer) => surfer.id !== id));
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
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  surferItem: {
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

export default SurfersManagement;
