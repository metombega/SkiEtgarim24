import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { Colors } from '@/app/config/constants/constants';

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };
  const handleUserButtonPress = (userType: string) => () => {
    console.log(`User type: ${userType}`);
    router.push(`/${userType}` as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Ski-Etgarim</Text>
            <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("surfer")}>
              <Text style={styles.userButtonText}>גולש</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("volunteer")}>
              <Text style={styles.userButtonText}>מתנדב</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("activity_manager")}>
              <Text style={styles.userButtonText}>אחראי משמרת</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userButton} onPress={handleUserButtonPress("admin")}>
              <Text style={styles.userButtonText}>רכז</Text>
            </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.light_orange,
  },
  logoutButton: {
    backgroundColor: Colors.light_blue,
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  userButton: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.dark_blue,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  userButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
