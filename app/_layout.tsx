import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../app/config/firebase";

export default function RootLayout() {
  return <Slot />;
}
