import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { SensorData } from "@/services/ApiService";
import { useThemeContext } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";

interface SensorDataCardProps {
  data: SensorData;
}

export function SensorDataCard({ data }: SensorDataCardProps) {
  const { theme } = useThemeContext();
  const colors = Colors[theme];

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

  // Extraer los datos de sensores dinámicamente
  const renderSensorValues = () => {
    // Estas son las claves que sabemos que no son datos de sensores
    const metadataKeys = ["id", "timestamp", "record_id"];

    return Object.keys(data)
      .filter((key) => !metadataKeys.includes(key))
      .map((key) => (
        <ThemedView key={key} style={styles.sensorValue}>
          <ThemedText type="defaultSemiBold" style={styles.sensorLabel}>
            {key.charAt(0).toUpperCase() + key.slice(1)}:
          </ThemedText>
          <ThemedText>
            {typeof data[key] === "number"
              ? data[key].toFixed(2)
              : String(data[key])}
          </ThemedText>
        </ThemedView>
      ));
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Sensor #{data.record_id}</ThemedText>
        <ThemedText style={[styles.timestamp, { color: colors.placeholder }]}>
          {formatDate(data.timestamp)}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sensorDataContainer}>
        {renderSensorValues()}
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
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
  },
  sensorDataContainer: {
    gap: 8,
  },
  sensorValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  sensorLabel: {
    minWidth: 100,
  },
});
