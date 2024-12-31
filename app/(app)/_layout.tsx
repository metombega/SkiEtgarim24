import { Stack } from "expo-router";
import { View } from "react-native";

export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: true,
        }}
      />
    </View>
  );
}
