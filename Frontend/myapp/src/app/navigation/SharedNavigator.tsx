// src/app/navigation/SharedNavigator.tsx
import { Stack } from "expo-router";
import type { SharedStackParamList } from "./types";

export default function SharedNavigator() {
  return (
    <Stack>
      {/* Shared screens go here */}
      {/* Example:
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      */}
    </Stack>
  );
}