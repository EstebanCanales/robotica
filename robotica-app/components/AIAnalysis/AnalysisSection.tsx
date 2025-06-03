import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AnalysisResult } from "@/services/DataAnalysisService";
import markdownStyles from "./MarkdownStyles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface AnalysisSectionProps {
  analysis: AnalysisResult | null;
  selectedAnalysis: AnalysisResult | null;
  fadeAnim: Animated.Value;
  onClearSelection: () => void;
  onHistoryPress: () => void;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  analysis,
  selectedAnalysis,
  fadeAnim,
  onClearSelection,
  onHistoryPress,
}) => {
  const { colorScheme } = useColorScheme();
  // Asegurar que solo sea 'light' o 'dark' para indexar Colors
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  // Usar el análisis seleccionado del dropdown o el análisis actual
  const displayAnalysis = selectedAnalysis || analysis;

  if (!displayAnalysis) return null;

  // Debug - mostrar estructura completa del análisis
  console.log(
    "[AnalysisSection] ESTRUCTURA DEL ANÁLISIS ACTUAL:",
    JSON.stringify(displayAnalysis, null, 2)
  );

  // Función mejorada para extraer el contenido de respuesta
  const extractResponseContent = () => {
    if (!displayAnalysis) return "";

    // Crear una copia para evitar problemas de referencia
    let responseData = { ...displayAnalysis };

    // CASO 1: La respuesta es una cadena de texto directa
    if (
      typeof responseData.response === "string" &&
      responseData.response.trim()
    ) {
      console.log(
        "[AnalysisSection] La respuesta es una cadena de texto directa"
      );
      return responseData.response.trim();
    }

    // CASO 2: La respuesta es un objeto con propiedad 'result'
    if (
      responseData.response &&
      typeof responseData.response === "object" &&
      "result" in responseData.response &&
      typeof responseData.response.result === "string"
    ) {
      console.log("[AnalysisSection] La respuesta tiene propiedad 'result'");
      return responseData.response.result.trim();
    }

    // CASO 3: La respuesta es un objeto con propiedad 'content'
    if (
      responseData.response &&
      typeof responseData.response === "object" &&
      "content" in responseData.response &&
      typeof responseData.response.content === "string"
    ) {
      console.log("[AnalysisSection] La respuesta tiene propiedad 'content'");
      return responseData.response.content.trim();
    }

    // CASO 4: La respuesta es un objeto con propiedad 'response'
    if (
      responseData.response &&
      typeof responseData.response === "object" &&
      "response" in responseData.response
    ) {
      console.log("[AnalysisSection] La respuesta tiene propiedad 'response'");
      const nestedResponse = responseData.response.response;

      if (typeof nestedResponse === "string" && nestedResponse.trim()) {
        return nestedResponse.trim();
      }

      if (typeof nestedResponse === "object" && nestedResponse) {
        if (
          "content" in nestedResponse &&
          typeof nestedResponse.content === "string"
        ) {
          return nestedResponse.content.trim();
        }

        if (
          "result" in nestedResponse &&
          typeof nestedResponse.result === "string"
        ) {
          return nestedResponse.result.trim();
        }

        // Si es un objeto sin propiedades específicas, convertirlo a JSON
        return JSON.stringify(nestedResponse, null, 2);
      }
    }

    // CASO 5: La respuesta es un objeto que no tiene propiedades de contenido específicas
    if (responseData.response && typeof responseData.response === "object") {
      console.log(
        "[AnalysisSection] La respuesta es un objeto sin propiedades específicas"
      );
      return JSON.stringify(responseData.response, null, 2);
    }

    // CASO 6: No hay response pero hay result
    if (typeof responseData.result === "string" && responseData.result.trim()) {
      console.log("[AnalysisSection] No hay 'response' pero hay 'result'");
      return responseData.result.trim();
    }

    // CASO 7: No hay response pero hay content
    if (
      typeof responseData.content === "string" &&
      responseData.content.trim()
    ) {
      console.log("[AnalysisSection] No hay 'response' pero hay 'content'");
      return responseData.content.trim();
    }

    // CASO 8: No hay respuesta pero hay mensaje
    if (
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      console.log("[AnalysisSection] No hay respuesta pero hay mensaje");
      return responseData.message.trim();
    }

    // No se encontró contenido válido
    console.log("[AnalysisSection] No se encontró contenido válido");
    return "";
  };

  // Extraer contenido para mostrar
  const responseContent = extractResponseContent();
  console.log(
    "[AnalysisSection] Longitud del contenido:",
    responseContent.length
  );
  console.log(
    "[AnalysisSection] Primeros 100 caracteres:",
    responseContent.substring(0, 100)
  );

  // Determinar si el contenido es JSON para mostrarlo adecuadamente
  const isJsonContent = (() => {
    try {
      if (!responseContent || typeof responseContent !== "string") return false;
      const trimmed = responseContent.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        // Intentar parsear como JSON
        JSON.parse(trimmed);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  })();

  // ID seguro para mostrar
  const safeResponseId =
    displayAnalysis.response_id !== undefined
      ? displayAnalysis.response_id
      : displayAnalysis.data_id !== undefined
      ? displayAnalysis.data_id
      : "sin-id";

  // Formatear fecha de manera segura
  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return "Fecha desconocida";

    try {
      // Intentar crear una fecha
      const date = new Date(timestamp);

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        // Formato alternativo de fecha (podría estar en formato epoch)
        if (!isNaN(Number(timestamp))) {
          const epochDate = new Date(
            Number(timestamp) * (timestamp.length <= 10 ? 1000 : 1)
          );
          if (!isNaN(epochDate.getTime())) {
            return epochDate.toLocaleString();
          }
        }
        return "Fecha inválida";
      }

      return date.toLocaleString();
    } catch (e) {
      return "Error de formato";
    }
  };

  return (
    <Animated.View
      style={[
        styles.analysisCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["rgba(0, 87, 163, 0.8)", "rgba(0, 87, 163, 0.6)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.analysisCardGradient}
      >
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>Análisis de Datos</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={onHistoryPress}
          >
            <MaterialCommunityIcons name="history" size={20} color="#fbfbfb" />
            <Text style={styles.historyButtonText}>Historial</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.markdownContainer}>
          {!responseContent ? (
            <Text style={styles.noContentText}>
              No hay contenido de análisis disponible.
            </Text>
          ) : isJsonContent ? (
            <View style={styles.contentView}>
              <Text style={styles.jsonText}>{responseContent}</Text>
            </View>
          ) : (
            <View style={styles.contentView}>
              <Markdown style={markdownStyles}>{responseContent}</Markdown>
            </View>
          )}
        </View>

        <View style={styles.analysisFooterContainer}>
          <Text style={styles.analysisFooter}>
            ID: {safeResponseId} • {formatDate(displayAnalysis.timestamp)}
          </Text>

          {selectedAnalysis && (
            <TouchableOpacity
              style={styles.clearSelectionButton}
              onPress={onClearSelection}
            >
              <Text style={styles.clearSelectionText}>
                Mostrar análisis actual
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  analysisCard: {
    borderRadius: 12,
    marginVertical: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  analysisCardGradient: {
    padding: 16,
    borderRadius: 12,
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fbfbfb",
  },
  markdownContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contentView: {
    width: "100%",
  },
  noContentText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    padding: 20,
    fontStyle: "italic",
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
  },
  analysisFooterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  analysisFooter: {
    fontSize: 12,
    color: "#fbfbfb",
    fontStyle: "italic",
  },
  clearSelectionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  clearSelectionText: {
    fontSize: 12,
    color: "#fbfbfb",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fbfbfb",
    marginLeft: 4,
  },
});

export default AnalysisSection;
