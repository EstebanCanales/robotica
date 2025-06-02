import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AnalysisResult } from "@/services/DataAnalysisService";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface HistoryItemProps {
  item: AnalysisResult;
  isSelected: boolean;
  onPress: (analysis: AnalysisResult) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  isSelected,
  onPress,
}) => {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];

  // Función mejorada para extraer título y previsualización
  const extractContent = () => {
    let title = "Análisis de datos";
    let preview = "No hay contenido disponible";

    // Crear una copia del item para evitar modificarlo
    const data = { ...item };

    // CASO 1: La respuesta es una cadena de texto
    if (typeof data.response === "string" && data.response.trim()) {
      const lines = data.response.trim().split("\n");
      if (lines.length > 0) {
        title = lines[0].replace(/^#+\s*/, "").trim();
        if (title.length > 30) {
          title = title.substring(0, 30) + "...";
        }

        if (lines.length > 1) {
          preview = lines.slice(1, 4).join(" ").trim();
          if (preview.length > 100) {
            preview = preview.substring(0, 100) + "...";
          }
        }
      }
    }
    // CASO 2: Hay campo result (string)
    else if (typeof data.result === "string" && data.result.trim()) {
      const lines = data.result.trim().split("\n");
      if (lines.length > 0) {
        title = lines[0].replace(/^#+\s*/, "").trim();
        if (title.length > 30) {
          title = title.substring(0, 30) + "...";
        }

        if (lines.length > 1) {
          preview = lines.slice(1, 4).join(" ").trim();
          if (preview.length > 100) {
            preview = preview.substring(0, 100) + "...";
          }
        }
      }
    }
    // CASO 3: Hay campo content (string)
    else if (typeof data.content === "string" && data.content.trim()) {
      const lines = data.content.trim().split("\n");
      if (lines.length > 0) {
        title = lines[0].replace(/^#+\s*/, "").trim();
        if (title.length > 30) {
          title = title.substring(0, 30) + "...";
        }

        if (lines.length > 1) {
          preview = lines.slice(1, 4).join(" ").trim();
          if (preview.length > 100) {
            preview = preview.substring(0, 100) + "...";
          }
        }
      }
    }
    // CASO 4: La respuesta está anidada en un objeto
    else if (data.response && typeof data.response === "object") {
      // Caso 4.1: La respuesta tiene campo response
      if (
        "response" in data.response &&
        typeof data.response.response === "string"
      ) {
        const lines = data.response.response.trim().split("\n");
        if (lines.length > 0) {
          title = lines[0].replace(/^#+\s*/, "").trim();
          if (title.length > 30) {
            title = title.substring(0, 30) + "...";
          }

          if (lines.length > 1) {
            preview = lines.slice(1, 4).join(" ").trim();
            if (preview.length > 100) {
              preview = preview.substring(0, 100) + "...";
            }
          }
        }
      }
      // Caso 4.2: La respuesta tiene campo result
      else if (
        "result" in data.response &&
        typeof data.response.result === "string"
      ) {
        const lines = data.response.result.trim().split("\n");
        if (lines.length > 0) {
          title = lines[0].replace(/^#+\s*/, "").trim();
          if (title.length > 30) {
            title = title.substring(0, 30) + "...";
          }

          if (lines.length > 1) {
            preview = lines.slice(1, 4).join(" ").trim();
            if (preview.length > 100) {
              preview = preview.substring(0, 100) + "...";
            }
          }
        }
      }
      // Caso 4.3: La respuesta tiene campo content
      else if (
        "content" in data.response &&
        typeof data.response.content === "string"
      ) {
        const lines = data.response.content.trim().split("\n");
        if (lines.length > 0) {
          title = lines[0].replace(/^#+\s*/, "").trim();
          if (title.length > 30) {
            title = title.substring(0, 30) + "...";
          }

          if (lines.length > 1) {
            preview = lines.slice(1, 4).join(" ").trim();
            if (preview.length > 100) {
              preview = preview.substring(0, 100) + "...";
            }
          }
        }
      }
      // Caso 4.4: Es un objeto JSON
      else {
        title = "Análisis JSON";
        try {
          const jsonString = JSON.stringify(data.response);
          preview =
            jsonString.substring(0, 100) +
            (jsonString.length > 100 ? "..." : "");
        } catch (e) {
          preview = "Contenido JSON";
        }
      }
    }
    // CASO 5: No hay datos de respuesta pero hay mensaje
    else if (typeof data.message === "string" && data.message.trim()) {
      const messageText = data.message.trim();
      preview =
        messageText.substring(0, 100) + (messageText.length > 100 ? "..." : "");
    }

    return { title, preview };
  };

  const { title, preview } = extractContent();

  // ID seguro
  const safeResponseId =
    item.response_id !== undefined
      ? item.response_id
      : item.data_id !== undefined
      ? item.data_id
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
    <TouchableOpacity
      style={[styles.historyItem, isSelected && styles.historyItemSelected]}
      onPress={() => onPress(item)}
    >
      <View style={styles.historyItemHeader}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={20}
          color="#0057A3"
        />
        <Text style={styles.historyItemTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.historyItemDate}>
        ID: {safeResponseId} • {formatDate(item.timestamp)}
      </Text>
      <Text style={styles.historyItemPreview} numberOfLines={2}>
        {preview}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  historyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  historyItemDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  historyItemPreview: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  historyItemSelected: {
    backgroundColor: "#f0f7ff",
    borderLeftWidth: 3,
    borderLeftColor: "#0057A3",
  },
});

export default HistoryItem;
