import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { useColorScheme as useColorSchemeOriginal } from "@/hooks/useColorScheme";

// Definir el tipo del contexto
type ColorScheme = "light" | "dark" | "system";
type ThemeContextType = {
  colorScheme: string;
  userTheme: ColorScheme;
  setColorScheme: (theme: ColorScheme) => Promise<void>;
  theme: "light" | "dark"; // Siempre es solo "light" o "dark", nunca "system"
};

// Crear el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Proveedor del contexto
export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorSchemeResult = useColorSchemeOriginal();
  const { colorScheme, userTheme, setColorScheme } = colorSchemeResult;

  // Siempre normalizar a light o dark (nunca system)
  const theme = colorScheme === "dark" ? "dark" : "light";

  // Para debugging
  useEffect(() => {
    console.log(
      `[ThemeContext] Theme changed to: ${theme}, userTheme: ${userTheme}`
    );
  }, [theme, userTheme]);

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        userTheme,
        setColorScheme,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para usar el tema
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
