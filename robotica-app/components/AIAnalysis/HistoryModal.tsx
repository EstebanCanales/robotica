import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { AnalysisResult } from "@/services/DataAnalysisService";
import { TimeFilter } from "@/components/AIAnalysis";
import HistoryItem from "./HistoryItem";
import FuturisticLoader from "./FuturisticLoader";
import AnimatedLoadingText from "./AnimatedLoadingText";
import { useThemeContext } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ProgressLoader } from "@/components/AIAnalysis";

interface HistoryModalProps {
  visible: boolean;
  historyLoading: boolean;
  filteredHistory: AnalysisResult[];
  historyFilter: TimeFilter;
  selectedAnalysis: AnalysisResult | null;
  onClose: () => void;
  onFilterChange: (filter: TimeFilter) => void;
  onSelectAnalysis: (analysis: AnalysisResult) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  historyLoading,
  filteredHistory,
  historyFilter,
  selectedAnalysis,
  onClose,
  onFilterChange,
  onSelectAnalysis,
}) => {
  const { theme } = useThemeContext();
  const colors = Colors[theme];

  // Función para comparar IDs y determinar si un elemento está seleccionado
  const isItemSelected = (item: AnalysisResult) => {
    if (!selectedAnalysis) return false;

    // Intentar comparar por response_id primero
    if (
      item.response_id !== undefined &&
      selectedAnalysis.response_id !== undefined
    ) {
      return item.response_id === selectedAnalysis.response_id;
    }

    // Si no hay response_id, intentar con data_id
    if (item.data_id !== undefined && selectedAnalysis.data_id !== undefined) {
      return item.data_id === selectedAnalysis.data_id;
    }

    // Si no hay IDs comparables, considerar no seleccionado
    return false;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { width: "90%", maxHeight: "80%" }]}>
          <Text style={styles.modalTitle}>Historial de Análisis</Text>

          {/* Filtros de tiempo */}
          <View style={styles.historyFilterContainer}>
            <TouchableOpacity
              style={[
                styles.historyFilterOption,
                historyFilter === "reciente" && styles.historyFilterActive,
              ]}
              onPress={() => onFilterChange("reciente")}
            >
              <Text
                style={[
                  styles.historyFilterText,
                  historyFilter === "reciente" &&
                    styles.historyFilterTextActive,
                ]}
              >
                Reciente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.historyFilterOption,
                historyFilter === "dia" && styles.historyFilterActive,
              ]}
              onPress={() => onFilterChange("dia")}
            >
              <Text
                style={[
                  styles.historyFilterText,
                  historyFilter === "dia" && styles.historyFilterTextActive,
                ]}
              >
                Hoy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.historyFilterOption,
                historyFilter === "semana" && styles.historyFilterActive,
              ]}
              onPress={() => onFilterChange("semana")}
            >
              <Text
                style={[
                  styles.historyFilterText,
                  historyFilter === "semana" && styles.historyFilterTextActive,
                ]}
              >
                Semana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.historyFilterOption,
                historyFilter === "todo" && styles.historyFilterActive,
              ]}
              onPress={() => onFilterChange("todo")}
            >
              <Text
                style={[
                  styles.historyFilterText,
                  historyFilter === "todo" && styles.historyFilterTextActive,
                ]}
              >
                Todo
              </Text>
            </TouchableOpacity>
          </View>

          {historyLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ProgressLoader
                indeterminate
                label="Cargando historial..."
                height={8}
                color={colors.tint}
              />
            </View>
          ) : filteredHistory.length === 0 ? (
            <View style={styles.historyEmpty}>
              <MaterialCommunityIcons
                name="file-search-outline"
                size={50}
                color="#ccc"
              />
              <Text style={styles.historyEmptyText}>
                No hay análisis en el período seleccionado
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredHistory}
              keyExtractor={(item, index) =>
                `history-item-${item.response_id || item.data_id || index}`
              }
              renderItem={({ item }) => (
                <HistoryItem
                  item={item}
                  isSelected={isItemSelected(item)}
                  onPress={(analysis) => {
                    onSelectAnalysis(analysis);
                    onClose();
                  }}
                />
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.historyItemSeparator} />
              )}
              contentContainerStyle={styles.historyList}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  historyFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  historyFilterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  historyFilterActive: {
    backgroundColor: "#0057A3",
  },
  historyFilterText: {
    fontSize: 12,
    color: "#333",
  },
  historyFilterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  modalLoadingContainer: {
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  historyEmpty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  historyEmptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  historyList: {
    paddingVertical: 8,
  },
  historyItemSeparator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  closeButton: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default HistoryModal;
