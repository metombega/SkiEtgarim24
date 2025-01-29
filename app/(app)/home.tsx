// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { useRouter } from "expo-router";

// export default function Home() {
//   const router = useRouter();

// const handleUserButtonPress = (userType: string) => () => {
//     console.log(`User type: ${userType}`);
//     router.push(`/${userType}` as any);
// }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Home Page</Text>
//       <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("surfer")}>
//         <Text style={styles.userButtonText}>גולש</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("volunteer")}>
//         <Text style={styles.userButtonText}>מתנדב</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("activity_manager")}>
//         <Text style={styles.userButtonText}>אחראי משמרת</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("admin")}>
//         <Text style={styles.userButtonText}>רכז</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#FF6B00",
//   },
//   userButton: {
//     width: "100%",
//     height: 50,
//     backgroundColor: "#0066CC", // Blue color
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   userButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
