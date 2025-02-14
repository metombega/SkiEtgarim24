import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { get, getDatabase, ref, set } from "firebase/database";

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
            username: key, // Assuming the key is the username
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

// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
// import { get, getDatabase, ref, set } from "firebase/database";
// import { User } from '@/types/user';

// const SurfersManagement = () => {
//   const [surfers, setSurfers] = useState<User[]>([]);
//   const [search, setSearch] = useState('');
//   const [filteredSurfers, setFilteredSurfers] = useState<User[]>([]); // Explicitly define the type here

//   useEffect(() => {
//     const fetchSurfers = async () => {
//       const db = getDatabase();
//       const surfersRef = ref(db, "users/surfers/");
//       const snapshot = await get(surfersRef);
//       const surfersList = snapshot.val();
//       const surfersArray = Object.keys(surfersList).map(key => ({
//         id: key,
//         ...surfersList[key],
//       }));
//       setSurfers(surfersArray); // Don't forget to set the surfers state
//     };

//     fetchSurfers();
//   }, []);

//   useEffect(() => {
//     setFilteredSurfers(
//       surfers.filter((surfer) =>
//         surfer.username?.toLowerCase().includes(search.toLowerCase())
//       )
//     );
//   }, [search, surfers]);

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.searchBar}
//         placeholder="Search Surfers"
//         value={search}
//         onChangeText={setSearch}
//       />
//       <FlatList
//         data={filteredSurfers}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.surferItem}>
//             <Text>{item.username}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   searchBar: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   surferItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: 'gray',
//   },
// });

// export default SurfersManagement;