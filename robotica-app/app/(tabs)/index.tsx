import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Text,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Image } from "expo-image";

import { useThemeContext } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { dataAnalysisService } from "@/services/DataAnalysisService";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  const { theme } = useThemeContext();
  const colors = Colors[theme];

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Intentamos cargar datos de sensores para verificar la conexión
        await dataAnalysisService.getSensorData(1);
        // Después de la carga, verificamos si se están usando datos simulados
        setUsingMockData(dataAnalysisService.isUsingMockData());
      } catch (error) {
        console.error("Error verificando conexión:", error);
      }
    };

    checkConnection();
  }, []);

  // Función para expandir/contraer FAQs

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Robotica App",
          headerLargeTitle: true,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header con logo */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.tint }]}>
            Robotica App
          </Text>
        </View>

        {/* Indicador de modo demo si estamos usando datos ficticios */}
        {usingMockData && (
          <View
            style={[
              styles.mockDataBanner,
              {
                backgroundColor:
                  theme === "light" ? `${colors.error}20` : colors.card,
                borderColor: colors.error,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="database-off"
              size={20}
              color={colors.error}
            />
            <Text style={[styles.mockDataText, { color: colors.error }]}>
              Modo Demo: Usando datos ficticios (sin conexión al servidor)
            </Text>
          </View>
        )}

        <LinearGradient
          colors={["#0057A3", "#2980b9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoCard}
        >
          <MaterialCommunityIcons name="robot" size={40} color="#fff" />
          <Text style={styles.cardTitle}>Monitoreo Inteligente</Text>
          <Text style={styles.cardText}>
            Sistema avanzado para análisis de datos y monitoreo de sensores
            mediante inteligencia artificial.
          </Text>
        </LinearGradient>

        {/* Información de la aplicación */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.placeholder }]}>
            RoboticApp v1.0.0
          </Text>
          <Text style={[styles.copyrightText, { color: colors.placeholder }]}>
            © 2023 RoboticApp. Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
  },
  cardText: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
  },
  copyrightText: {
    fontSize: 12,
    marginTop: 4,
  },
  mockDataBanner: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  mockDataText: {
    fontSize: 14,
    marginLeft: 8,
  },
});
