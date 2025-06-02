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
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Stack } from "expo-router";
import { Image } from "expo-image";

import { ThemedText, ThemedView } from "@/components";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { dataAnalysisService } from "@/services/DataAnalysisService";

const { width } = Dimensions.get("window");

// FAQ items
interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "¿Qué hace esta aplicación?",
    answer:
      "RoboticApp analiza datos de sensores IoT utilizando inteligencia artificial para proporcionar información valiosa sobre las condiciones ambientales y ayudar a tomar mejores decisiones basadas en datos.",
  },
  {
    question: "¿Cómo funciona el análisis de IA?",
    answer:
      "La aplicación recopila datos de varios sensores (temperatura, humedad, luz, presión, etc.) y utiliza modelos de aprendizaje automático para analizar patrones y generar información útil y recomendaciones.",
  },
  {
    question: "¿Puedo ver datos históricos?",
    answer:
      "Sí, la aplicación almacena todos los análisis generados, permitiéndote acceder a un historial completo de resultados anteriores y revisar las tendencias a lo largo del tiempo.",
  },
];

export default function HomeScreen() {
  // Estado para FAQs expandibles
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  // Configuración del tema
  const colorSchemeResult = useColorScheme();

  // Verificamos si es un objeto (implementación normal) o string (implementación web)
  const colorScheme =
    typeof colorSchemeResult === "object"
      ? colorSchemeResult.colorScheme
      : colorSchemeResult;
  const userTheme =
    typeof colorSchemeResult === "object"
      ? colorSchemeResult.userTheme
      : colorScheme;
  const setColorScheme =
    typeof colorSchemeResult === "object" && colorSchemeResult.setColorScheme
      ? colorSchemeResult.setColorScheme
      : () => console.log("Cambio de tema no disponible en web");

  const theme = colorScheme === "dark" ? "dark" : "light"; // Asegurando que solo sea "light" o "dark"
  const colors = Colors[theme];

  // Comprobar si estamos usando datos simulados
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
  const toggleFaq = (index: number) => {
    Haptics.selectionAsync();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderFaqItem = (item: FaqItem, index: number) => {
    const isExpanded = expandedIndex === index;

    const animatedStyle = useAnimatedStyle(() => {
      return {
        maxHeight: isExpanded
          ? withTiming(1000, { duration: 300 })
          : withTiming(0, { duration: 300 }),
        opacity: isExpanded
          ? withTiming(1, { duration: 300 })
          : withTiming(0, { duration: 200 }),
      };
    });

    return (
      <View style={styles.faqItem} key={index}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => toggleFaq(index)}
          activeOpacity={0.7}
        >
          <Text style={[styles.questionText, { color: colors.text }]}>
            {item.question}
          </Text>
          <MaterialCommunityIcons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.tint}
          />
        </TouchableOpacity>

        <Animated.View style={[styles.faqAnswer, animatedStyle]}>
          <Text style={[styles.answerText, { color: colors.text }]}>
            {item.answer}
          </Text>
        </Animated.View>
      </View>
    );
  };

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
                backgroundColor: `${colors.error}20`,
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

        {/* Sección de tema */}
        <Text style={[styles.sectionTitle, { color: colors.tint }]}>
          Tema de la aplicación
        </Text>

        <View
          style={[
            styles.themeContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                userTheme === "light" && {
                  backgroundColor: `${colors.tint}20`,
                  borderColor: colors.tint,
                },
              ]}
              onPress={() => setColorScheme("light")}
            >
              <View style={styles.themeIconContainer}>
                <MaterialCommunityIcons
                  name="white-balance-sunny"
                  size={24}
                  color={userTheme === "light" ? colors.tint : colors.icon}
                />
              </View>
              <Text
                style={[
                  styles.themeText,
                  { color: userTheme === "light" ? colors.tint : colors.text },
                ]}
              >
                Claro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                userTheme === "dark" && {
                  backgroundColor: `${colors.tint}20`,
                  borderColor: colors.tint,
                },
              ]}
              onPress={() => setColorScheme("dark")}
            >
              <View style={styles.themeIconContainer}>
                <MaterialCommunityIcons
                  name="moon-waning-crescent"
                  size={24}
                  color={userTheme === "dark" ? colors.tint : colors.icon}
                />
              </View>
              <Text
                style={[
                  styles.themeText,
                  { color: userTheme === "dark" ? colors.tint : colors.text },
                ]}
              >
                Oscuro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                userTheme === "system" && {
                  backgroundColor: `${colors.tint}20`,
                  borderColor: colors.tint,
                },
              ]}
              onPress={() => setColorScheme("system")}
            >
              <View style={styles.themeIconContainer}>
                <MaterialCommunityIcons
                  name="theme-light-dark"
                  size={24}
                  color={userTheme === "system" ? colors.tint : colors.icon}
                />
              </View>
              <Text
                style={[
                  styles.themeText,
                  { color: userTheme === "system" ? colors.tint : colors.text },
                ]}
              >
                Sistema
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.tint }]}>
          Preguntas frecuentes
        </Text>

        <View
          style={[
            styles.faqContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {faqs.map((faq, index) => renderFaqItem(faq, index))}
        </View>

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
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 16,
  },
  themeContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  themeOption: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  themeIconContainer: {
    marginBottom: 8,
  },
  themeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  faqContainer: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  faqQuestion: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: "hidden",
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
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
    borderColor: "#e0e0e0",
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
