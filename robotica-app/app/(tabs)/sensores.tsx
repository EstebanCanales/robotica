import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import SensorDataDisplay from "@/components/SensorDataDisplay";
import { useThemeContext } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";

/**
 * Pantalla de datos de sensores
 */
export default function SensoresScreen() {
  const { theme } = useThemeContext();
  const colors = Colors[theme];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Sensores",
          headerLargeTitle: true,
        }}
      />
      <SensorDataDisplay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
