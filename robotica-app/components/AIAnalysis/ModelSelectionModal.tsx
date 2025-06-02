import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { ModelInfo } from "@/services/DataAnalysisService";
import FuturisticLoader from "./FuturisticLoader";
import AnimatedLoadingText from "./AnimatedLoadingText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ProgressLoader } from "@/components/AIAnalysis";

interface ModelSelectionModalProps {
  visible: boolean;
  isLoadingModels: boolean;
  modelos: ModelInfo[];
  isChangingModel: boolean;
  onClose: () => void;
  onModelSelect: (modelName: string) => void;
}

const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  visible,
  isLoadingModels,
  modelos,
  isChangingModel,
  onClose,
  onModelSelect,
}) => {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Seleccionar Modelo de IA
          </Text>

          {isLoadingModels ? (
            <View style={styles.modalLoadingContainer}>
              <ProgressLoader
                indeterminate
                label="Cargando modelos..."
                height={8}
                color={colors.tint}
              />
            </View>
          ) : modelos.length === 0 ? (
            <Text
              style={[styles.modalEmptyText, { color: colors.placeholder }]}
            >
              No hay modelos disponibles
            </Text>
          ) : (
            <FlatList
              data={modelos}
              keyExtractor={(item) => item.nombre}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modelItem,
                    item.activo && [
                      styles.activeModelItem,
                      { backgroundColor: `${colors.tint}15` },
                    ],
                  ]}
                  onPress={() => onModelSelect(item.nombre)}
                  disabled={isChangingModel || item.activo}
                >
                  <Text
                    style={[
                      styles.modelItemText,
                      { color: colors.text },
                      item.activo && { color: colors.tint, fontWeight: "600" },
                    ]}
                  >
                    {item.nombre}
                  </Text>
                  {item.activo && (
                    <Text
                      style={[
                        styles.activeModelIndicator,
                        { color: colors.tint },
                      ]}
                    >
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>
              Cerrar
            </Text>
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
    width: "80%",
    maxHeight: "70%",
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
  modalLoadingContainer: {
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  modalEmptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },
  modelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  activeModelItem: {
    backgroundColor: "#f0f7ff",
  },
  modelItemText: {
    fontSize: 16,
    color: "#333",
  },
  activeModelItemText: {
    fontWeight: "bold",
    color: "#0057A3",
  },
  activeModelIndicator: {
    fontSize: 16,
    color: "#0057A3",
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

export default ModelSelectionModal;
