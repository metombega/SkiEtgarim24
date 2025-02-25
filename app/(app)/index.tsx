import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { Colors } from "@/app/config/constants/constants";

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
      <Text style={styles.title}>ברוכים הבאים לסקי אתגרים</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.userButton, { backgroundColor: Colors.red_primary }]}
          onPress={handleUserButtonPress("surfer")}
        >
          <Text style={[styles.userButtonText]}>גולש</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userButton, { backgroundColor: Colors.green_primary }]}
          onPress={handleUserButtonPress("volunteer")}
        >
          <Text style={[styles.userButtonText]}>מתנדב</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.userButton, { backgroundColor: Colors.light_blue }]}
          onPress={handleUserButtonPress("activity_manager")}
        >
          <Text style={styles.userButtonText}>אחראי משמרת</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userButton, { backgroundColor: Colors.dark_orange }]}
          onPress={handleUserButtonPress("admin")}
        >
          <Text style={[styles.userButtonText]}>רכז</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>התנתק</Text>
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
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.light_orange,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: Colors.black,
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: Colors.dark_blue,
    borderRadius: 5,
    height: 100,
  },
  userButtonText: {
    fontSize: 18,
    color: Colors.black,
    fontWeight: "bold",
  },
});
