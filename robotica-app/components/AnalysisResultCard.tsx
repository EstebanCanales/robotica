import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

interface AnalysisResultCardProps {
  id: number;
  data_id: number;
  result: string;
  timestamp: string;
}

export function AnalysisResultCard({
  id,
  data_id,
  result,
  timestamp,
}: AnalysisResultCardProps) {
  // Formatear la fecha para mostrarla de forma amigable
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Análisis #{id}</ThemedText>
        <ThemedText style={styles.timestamp}>
          {formatDate(timestamp)}
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.dataIdText}>
        Datos analizados: #{data_id}
      </ThemedText>

      <ThemedView style={styles.resultContainer}>
        <ThemedText>{result}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  dataIdText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  resultContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    padding: 12,
    borderRadius: 6,
  },
});
