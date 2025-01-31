import { Button, Text, View } from "react-native";
import { auth } from "../app/config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

const router = useRouter();

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/login");
  } catch (error: any) {
    console.error("Error logging out:", error.message);
  }
};

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      {/* logout button */}
      <Button
        title="Logout - This is a hacky way to logout"
        onPress={() => {
          handleLogout();
        }}
      />
    </View>
  );
}
