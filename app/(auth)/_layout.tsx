import { Stack } from "expo-router";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Surfers Management" }} />
        <Stack.Screen name="surfer_details" options={{ title: "Surfer Details" }} />
      </Stack>
    </View>
  );
}

