import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../app/config/firebase";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === "(auth)";

      if (!user && !inAuthGroup) {
        // Redirect to the login page if not logged in
        router.replace("/login");
      } else if (user && inAuthGroup) {
        // Redirect to the home page if logged in
        router.replace("/");
      }
    });

    return unsubscribe;
  }, [segments]);

  return <Slot />;
}
