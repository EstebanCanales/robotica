import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Linking,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ThemedView, ThemedText } from "@/components";
import { useState } from "react";
import { useThemeContext } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { withTiming } from "react-native-reanimated";
import { useAnimatedStyle } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

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

const renderFaqItem = (item: FaqItem, index: number) => {
  const { theme } = useThemeContext();
  const colors = Colors[theme];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const isExpanded = expandedIndex === index;

  const toggleFaq = (index: number) => {
    Haptics.selectionAsync();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
    <View
      style={[styles.faqItem, { borderBottomColor: colors.border }]}
      key={index}
    >
      <TouchableOpacity
        style={[styles.faqQuestion]}
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

export default function ExploreScreen() {
  const { theme } = useThemeContext();
  const colors = Colors[theme];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="help-circle"
            size={40}
            color={colors.tint}
          />
          <ThemedText type="title" style={styles.title}>
            Ayuda
          </ThemedText>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Guía de la aplicación
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Esta aplicación permite monitorear y analizar datos de sensores IoT
            utilizando inteligencia artificial.
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Explora las distintas secciones para visualizar datos en tiempo
            real, realizar análisis y configurar tu experiencia.
          </ThemedText>
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
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Contacto
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Si tienes alguna pregunta o sugerencia, no dudes en contactarnos:
          </ThemedText>
          <Text
            style={[styles.link, { color: colors.tint }]}
            onPress={() => Linking.openURL("mailto:support@robotica-app.com")}
          >
            support@robotica-app.com
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Versión
          </ThemedText>
          <ThemedText style={styles.paragraph}>Robotica App v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    marginLeft: 12,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    marginVertical: 8,
    textDecorationLine: "underline",
  },
  faqContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  faqItem: {
    borderBottomWidth: 1,
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
});
