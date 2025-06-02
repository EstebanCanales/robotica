import { useColorScheme as useRNColorScheme } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tema personalizado: 'light' | 'dark' | 'system' (sigue el sistema)
type ColorScheme = "light" | "dark" | "system";
const THEME_STORAGE_KEY = "robotica_user_theme_preference";

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const [userTheme, setUserTheme] = useState<ColorScheme>("system");
  
  // Cargar preferencia de tema guardada
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setUserTheme(savedTheme as ColorScheme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Función para cambiar el tema
  const setColorScheme = async (theme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setUserTheme(theme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };
  
  // Si está en modo sistema, devuelve el del sistema, de lo contrario usa el tema del usuario
  const activeColorScheme = userTheme === "system" ? systemColorScheme : userTheme;
  
  return {
    colorScheme: activeColorScheme || "light",
    userTheme,
    setColorScheme,
  };
}
