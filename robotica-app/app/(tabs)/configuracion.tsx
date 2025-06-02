import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dataAnalysisService, { ModelInfo } from "@/services/DataAnalysisService";
import { ProgressLoader } from "@/components/AIAnalysis";

export default function ConfiguracionScreen() {
  // Tema
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

  // Estados para modelos IA
  const [modelos, setModelos] = useState<ModelInfo[]>([]);
  const [modeloActivo, setModeloActivo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingModel, setIsChangingModel] = useState(false);
  const [modeloModalVisible, setModeloModalVisible] = useState(false);

  // Cargar modelos disponibles
  useEffect(() => {
    const loadModelos = async () => {
      try {
        setIsLoading(true);
        const result = await dataAnalysisService.obtenerModelos();
        setModelos(result.modelos);
        setModeloActivo(result.modelo_activo);
      } catch (error) {
        console.error("[Configuración] Error cargando modelos:", error);
        Alert.alert(
          "Error",
          "No se pudieron cargar los modelos. Inténtalo de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadModelos();
  }, []);

  // Función para cambiar modelo activo
  const handleModelSelect = async (modelName: string) => {
    if (modelName === modeloActivo) {
      setModeloModalVisible(false);
      return;
    }

    try {
      setIsChangingModel(true);
      const result = await dataAnalysisService.cambiarModelo(modelName);

      if (result) {
        setModeloActivo(modelName);
        Alert.alert("Éxito", `Modelo cambiado a: ${modelName}`);
      }
    } catch (error) {
      console.error("[Configuración] Error cambiando modelo:", error);
      Alert.alert("Error", "No se pudo cambiar el modelo. Inténtalo de nuevo.");
    } finally {
      setIsChangingModel(false);
      setModeloModalVisible(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Configuración
        </Text>
        <MaterialCommunityIcons name="cog" size={24} color={colors.secondary} />
      </View>

      {/* Sección de Tema */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tema de la aplicación
        </Text>

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

      {/* Sección de IA */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Modelo de Inteligencia Artificial
        </Text>

        <TouchableOpacity
          style={[styles.modelSelector, { borderColor: colors.border }]}
          onPress={() => setModeloModalVisible(true)}
          disabled={isLoading || isChangingModel}
        >
          <View style={styles.modelSelectorContent}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={24}
              color={isLoading ? colors.placeholder : colors.tint}
            />
            <Text style={[styles.modelText, { color: colors.text }]}>
              {isLoading
                ? "Cargando modelos..."
                : modeloActivo || "Seleccionar modelo"}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.icon}
          />
        </TouchableOpacity>

        {isLoading && (
          <View style={styles.loaderContainer}>
            <ProgressLoader
              indeterminate
              label="Cargando modelos disponibles"
              height={6}
            />
          </View>
        )}
      </View>

      {/* Sección de Información */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Acerca de
        </Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>
            Versión:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>
            Desarrollado por:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            Robótica - Equipo 1
          </Text>
        </View>
      </View>

      {/* Modal de selección de modelo */}
      <Modal
        visible={modeloModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModeloModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Seleccionar modelo de IA
              </Text>
              <TouchableOpacity
                onPress={() => setModeloModalVisible(false)}
                disabled={isChangingModel}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.icon}
                />
              </TouchableOpacity>
            </View>

            {isChangingModel ? (
              <View style={styles.loadingContainer}>
                <ProgressLoader
                  indeterminate
                  label="Cambiando modelo..."
                  height={8}
                />
              </View>
            ) : (
              <ScrollView style={styles.modelList}>
                {modelos.map((modelo) => (
                  <TouchableOpacity
                    key={modelo.nombre}
                    style={[
                      styles.modelItem,
                      modelo.nombre === modeloActivo && {
                        backgroundColor: `${colors.tint}15`,
                      },
                    ]}
                    onPress={() => handleModelSelect(modelo.nombre)}
                  >
                    <Text
                      style={[
                        styles.modelItemText,
                        { color: colors.text },
                        modelo.nombre === modeloActivo && {
                          color: colors.tint,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {modelo.nombre}
                    </Text>
                    {modelo.nombre === modeloActivo && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={colors.tint}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
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
  modelSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modelSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modelText: {
    marginLeft: 12,
    fontSize: 16,
  },
  loaderContainer: {
    marginTop: 16,
  },
  loadingContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modelList: {
    padding: 8,
  },
  modelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  modelItemText: {
    fontSize: 16,
  },
});
