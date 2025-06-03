import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

import { Colors } from "@/constants/Colors";
import { useThemeContext } from "@/hooks/ThemeContext";
import { ThemedTabBar } from "@/components";

export default function TabLayout() {
  const { theme } = useThemeContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
      // @ts-ignore - Ignoramos el error de tipo aquí debido a versiones inconsistentes
      tabBar={(props) => <ThemedTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sensores"
        options={{
          title: "Sensores",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="temperature-celsius"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analisis"
        options={{
          title: "Análisis IA",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="robot" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Ayuda",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
