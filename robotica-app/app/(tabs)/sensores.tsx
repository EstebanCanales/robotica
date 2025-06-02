import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import SensorDataDisplay from "@/components/SensorDataDisplay";

/**
 * Pantalla de datos de sensores
 */
export default function SensoresScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
    backgroundColor: "#fbfbfb",
  },
});
