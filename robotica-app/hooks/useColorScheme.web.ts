import { useColorScheme as useRNColorScheme } from "react-native";
import { useEffect, useState } from "react";

// Tema personalizado: 'light' | 'dark' | 'system' (sigue el sistema)
type ColorScheme = "light" | "dark" | "system";
const THEME_STORAGE_KEY = "robotica_user_theme_preference";

/**
 * Versión web del hook useColorScheme con la misma funcionalidad que la móvil
 */
export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const [userTheme, setUserTheme] = useState<ColorScheme>("system");
  const [hasHydrated, setHasHydrated] = useState(false);
  
  // Detectar hidratación del componente (sólo relevante para web)
  useEffect(() => {
    setHasHydrated(true);
    console.log("Web theme hook inicializado correctamente");
  }, []);
  
  // Cargar preferencia de tema guardada desde localStorage
  useEffect(() => {
    if (hasHydrated) {
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setUserTheme(savedTheme as ColorScheme);
          console.log("Tema cargado desde localStorage:", savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    }
  }, [hasHydrated]);
  
  // Función para cambiar el tema
  const setColorScheme = async (theme: ColorScheme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      setUserTheme(theme);
      console.log("Tema cambiado a:", theme);
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
