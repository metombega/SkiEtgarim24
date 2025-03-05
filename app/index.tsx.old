import { Button, Text, View } from "react-native";
import { auth } from "../app/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === "(auth)";

      if (!user && !inAuthGroup) {
        router.replace("/login");
      } else if (user && inAuthGroup) {
        // Redirect to the home page if logged in
        router.replace("/(app)");
      }
    });

    return unsubscribe;
  }, [segments]);

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
