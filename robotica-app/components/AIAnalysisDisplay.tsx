import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import dataAnalysisService, {
  AnalysisResult,
  ModelInfo,
} from "@/services/DataAnalysisService";
import {
  AnalysisButton,
  AnalysisSection,
  HistoryModal,
  HistoryDropdown,
  TimeFilter,
  ProgressLoader,
} from "@/components/AIAnalysis";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useThemeContext } from "@/hooks/ThemeContext";

const AIAnalysisDisplay: React.FC = () => {
  // Usar el contexto de tema global para que responda a cambios
  const { theme } = useThemeContext();
  const colors = Colors[theme];

  // Estados
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState<AnalysisResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<TimeFilter>("reciente");
  const [modelSelectorVisible, setModelSelectorVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [isDebugging, setIsDebugging] = useState(false); // Estado para el modo debug

  // Estados para el selector de modelo
  const [currentModel, setCurrentModel] = useState("");
  const [isChangingModel, setIsChangingModel] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelos, setModelos] = useState<ModelInfo[]>([]);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Cargar historial al inicio y modelos disponibles
  useEffect(() => {
    const initApp = async () => {
      try {
        // Cargar análisis más reciente primero
        await loadMostRecentAnalysis();

        // Luego cargar modelos disponibles
        await loadModelos();

        // Marcar que se ha cargado todo
        setInitialLoadDone(true);
      } catch (error) {
        console.error("[AIAnalysisDisplay] Error en carga inicial:", error);
        setErrorMsg("Error al cargar datos iniciales");
      }
    };

    // Iniciar la carga asíncrona
    initApp();
  }, []);

  // Cargar historial cuando cambia el filtro
  useEffect(() => {
    if (initialLoadDone) {
      loadHistory();
    }
  }, [historyFilter, initialLoadDone]);

  // Limpiar mensaje de error después de 5 segundos
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Cerrar dropdown al hacer clic fuera
  const handleScreenPress = () => {
    if (dropdownVisible) {
      setDropdownVisible(false);
    }
  };

  // Función para mostrar todas las respuestas en consola (debug)
  const handleDebugResponses = async () => {
    try {
      setIsDebugging(true);
      console.log(
        "[AIAnalysisDisplay] Iniciando debug de todas las respuestas..."
      );
      await dataAnalysisService.mostrarTodasLasRespuestas();
      console.log(
        "[AIAnalysisDisplay] Todas las respuestas han sido mostradas en consola"
      );
    } catch (error) {
      console.error("[AIAnalysisDisplay] Error durante debug:", error);
      setErrorMsg("Error al depurar respuestas");
    } finally {
      setIsDebugging(false);
    }
  };

  // Función para cargar el análisis más reciente
  const loadMostRecentAnalysis = async () => {
    try {
      setHistoryLoading(true);
      console.log("[AIAnalysisDisplay] Cargando el análisis más reciente...");

      // Obtener solo una respuesta (la más reciente)
      const responses = await dataAnalysisService.obtenerRespuestas(1);

      if (responses && responses.length > 0) {
        const mostRecent = responses[0];

        // Verificar si la respuesta tiene contenido válido
        const hasValidContent =
          (typeof mostRecent.response === "string" &&
            mostRecent.response.trim() !== "") ||
          (typeof mostRecent.result === "string" &&
            mostRecent.result.trim() !== "") ||
          (typeof mostRecent.content === "string" &&
            mostRecent.content.trim() !== "") ||
          (mostRecent.response && typeof mostRecent.response === "object") ||
          (typeof mostRecent.message === "string" &&
            mostRecent.message.trim() !== "");

        if (hasValidContent) {
          console.log(
            "[AIAnalysisDisplay] Análisis más reciente cargado:",
            JSON.stringify(mostRecent, null, 2)
          );

          // Establecer como el análisis actual
          setAnalysis(mostRecent);

          // Animar entrada del análisis
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();

          // Inicializar el historial filtrado con esta respuesta
          setFilteredHistory([mostRecent]);

          return mostRecent;
        } else {
          console.warn(
            "[AIAnalysisDisplay] La respuesta más reciente no contiene datos válidos"
          );
          setAnalysis(null);
          setFilteredHistory([]);
          return null;
        }
      } else {
        console.log("[AIAnalysisDisplay] No se encontraron análisis previos");
        setAnalysis(null);
        setFilteredHistory([]);
        return null;
      }
    } catch (error) {
      console.error(
        "[AIAnalysisDisplay] Error cargando análisis reciente:",
        error
      );
      setErrorMsg(
        `Error al cargar análisis reciente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      setAnalysis(null);
      setFilteredHistory([]);
      throw error;
    } finally {
      setHistoryLoading(false);
    }
  };

  // Función para cargar modelos disponibles
  const loadModelos = async () => {
    try {
      setIsLoadingModels(true);
      const result = await dataAnalysisService.obtenerModelos();
      console.log("[AIAnalysisDisplay] Modelos cargados:", result);
      setModelos(result.modelos);
      setCurrentModel(result.modelo_activo);
    } catch (error) {
      console.error("[AIAnalysisDisplay] Error cargando modelos:", error);
      setErrorMsg("Error al cargar modelos");
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Función para cambiar modelo activo
  const handleModelSelect = async (modelName: string) => {
    try {
      setIsChangingModel(true);
      await dataAnalysisService.cambiarModelo(modelName);
      setCurrentModel(modelName);
      setModelSelectorVisible(false);
    } catch (error) {
      console.error("[AIAnalysisDisplay] Error cambiando modelo:", error);
      setErrorMsg("No se pudo cambiar el modelo");
      Alert.alert("Error", "No se pudo cambiar el modelo. Inténtalo de nuevo.");
    } finally {
      setIsChangingModel(false);
    }
  };

  // Función para iniciar análisis de datos
  const handleProcessData = async () => {
    try {
      setProcessing(true);
      setErrorMsg(null);

      // Animar botón
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Obtener análisis
      console.log("[AIAnalysisDisplay] Iniciando procesamiento de datos...");
      const result = await dataAnalysisService.procesarDatos();
      console.log(
        "[AIAnalysisDisplay] Resultado de análisis:",
        JSON.stringify(result, null, 2)
      );

      if (!result) {
        throw new Error("No se recibió respuesta del servidor");
      }

      // Limpiar cualquier análisis seleccionado previamente
      setSelectedAnalysis(null);

      // Establecer el nuevo análisis como el análisis actual
      setAnalysis(result);

      // Actualizar historial
      await loadHistory();

      // Animar entrada del análisis
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("[AIAnalysisDisplay] Error procesando datos:", error);
      setErrorMsg("Error al procesar los datos");
      Alert.alert(
        "Error",
        "Ocurrió un error al procesar los datos. Inténtalo de nuevo."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Cargar historial de análisis
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      setErrorMsg(null);

      console.log("[AIAnalysisDisplay] Cargando historial...");

      // Intentar obtener historial con un timeout más largo para respuestas grandes
      const responses = (await Promise.race([
        dataAnalysisService.obtenerRespuestas(30),
        new Promise<AnalysisResult[]>((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout al cargar respuestas")),
            15000
          )
        ),
      ])) as AnalysisResult[];

      console.log(
        "[AIAnalysisDisplay] Historial cargado:",
        responses.length,
        "elementos"
      );

      // Verificar si hay respuestas
      if (!responses || responses.length === 0) {
        console.warn(
          "[AIAnalysisDisplay] No se encontraron elementos de historial"
        );
        setFilteredHistory([]);
        return;
      }

      if (responses && responses.length > 0) {
        // Mostrar información detallada del primer elemento para diagnóstico
        console.log(
          "[AIAnalysisDisplay] Primer elemento del historial:",
          JSON.stringify(responses[0], null, 2)
        );

        // Verificar que las respuestas tengan la estructura esperada
        const responsesWithContent = responses.filter(
          (item) =>
            item &&
            ((typeof item.response === "string" &&
              item.response.trim() !== "") ||
              (typeof item.result === "string" && item.result.trim() !== "") ||
              (typeof item.content === "string" &&
                item.content.trim() !== "") ||
              (item.response && typeof item.response === "object") ||
              (typeof item.message === "string" && item.message.trim() !== ""))
        );

        console.log(
          "[AIAnalysisDisplay] Elementos con contenido válido:",
          responsesWithContent.length
        );

        // Si hay elementos válidos, continuar con el filtrado
        if (responsesWithContent.length > 0) {
          const filteredResponses = filterResponsesByTime(
            responsesWithContent,
            historyFilter
          );
          console.log(
            "[AIAnalysisDisplay] Elementos filtrados por tiempo:",
            filteredResponses.length
          );

          setFilteredHistory(filteredResponses);
        } else {
          console.warn(
            "[AIAnalysisDisplay] No se encontraron elementos con contenido válido"
          );
          setFilteredHistory([]);
        }
      }
    } catch (error) {
      console.error("[AIAnalysisDisplay] Error cargando historial:", error);
      setErrorMsg(
        `Error al cargar historial: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      setFilteredHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filtrar respuestas por tiempo
  const filterResponsesByTime = (
    responses: AnalysisResult[],
    filter: TimeFilter
  ): AnalysisResult[] => {
    // Verificar que responses es un array
    if (!Array.isArray(responses)) {
      console.warn("[AIAnalysisDisplay] responses no es un array:", responses);
      return [];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return responses.filter((item) => {
      if (!item) return false;

      // Si no tiene timestamp, asumimos que es reciente
      if (!item.timestamp) return filter === "reciente" || filter === "todo";

      try {
        const date = new Date(item.timestamp);

        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
          // Si no es una fecha válida, lo incluimos en reciente o todo
          return filter === "reciente" || filter === "todo";
        }

        switch (filter) {
          case "reciente":
            return date >= yesterday;
          case "dia":
            return date >= today;
          case "semana":
            return date >= lastWeek;
          case "todo":
            return true;
          default:
            return true;
        }
      } catch (e) {
        // Si hay error al procesar la fecha, lo incluimos en reciente o todo
        return filter === "reciente" || filter === "todo";
      }
    });
  };

  // Seleccionar un análisis del historial
  const handleSelectAnalysis = async (selectedItem: AnalysisResult) => {
    try {
      console.log(
        "[AIAnalysisDisplay] Seleccionando análisis:",
        JSON.stringify(selectedItem, null, 2)
      );

      setHistoryLoading(true);

      // Determinar el ID a utilizar para obtener la respuesta completa
      const responseId = selectedItem.response_id || selectedItem.data_id;

      if (responseId !== undefined) {
        console.log(
          `[AIAnalysisDisplay] Obteniendo detalles para ID=${responseId}`
        );

        try {
          // Obtener la respuesta completa por ID (esto asegura que obtenemos todos los detalles)
          const completeResponse =
            await dataAnalysisService.obtenerRespuestaPorId(responseId);

          if (
            completeResponse &&
            (completeResponse.response ||
              completeResponse.result ||
              completeResponse.content)
          ) {
            console.log(
              "[AIAnalysisDisplay] Respuesta completa obtenida:",
              JSON.stringify(completeResponse, null, 2)
            );
            // Usar la respuesta completa
            selectedItem = completeResponse;
          } else {
            console.warn(
              "[AIAnalysisDisplay] La respuesta completa no tiene contenido válido, usando la respuesta resumida"
            );
          }
        } catch (error) {
          console.error(
            "[AIAnalysisDisplay] Error obteniendo respuesta completa:",
            error
          );
          // Continuar con la respuesta resumida si falla
        }
      } else {
        console.warn(
          "[AIAnalysisDisplay] No se encontró ID para obtener respuesta completa, usando respuesta resumida"
        );
      }

      // Verificar que el ítem tenga contenido válido
      const hasValidContent =
        (typeof selectedItem.response === "string" &&
          selectedItem.response.trim() !== "") ||
        (typeof selectedItem.result === "string" &&
          selectedItem.result.trim() !== "") ||
        (typeof selectedItem.content === "string" &&
          selectedItem.content.trim() !== "") ||
        (selectedItem.response && typeof selectedItem.response === "object") ||
        (typeof selectedItem.message === "string" &&
          selectedItem.message.trim() !== "");

      if (!hasValidContent) {
        console.warn(
          "[AIAnalysisDisplay] El análisis seleccionado no tiene contenido válido"
        );
        setErrorMsg("El análisis seleccionado no tiene contenido válido");
        setSelectedAnalysis(null);
        return;
      }

      // Establecer el análisis seleccionado
      setSelectedAnalysis(selectedItem);
      setDropdownVisible(false);
      setHistoryVisible(false);

      // Animar entrada del análisis seleccionado
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      console.log(
        "[AIAnalysisDisplay] Análisis seleccionado establecido con éxito"
      );
    } catch (error) {
      console.error(
        "[AIAnalysisDisplay] Error al seleccionar análisis:",
        error
      );
      setErrorMsg(
        `Error al cargar análisis seleccionado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // Limpiar análisis seleccionado
  const handleClearSelection = () => {
    setSelectedAnalysis(null);

    // Animar entrada del análisis actual
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Toggle dropdown con cierre automático
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {/*
         Botón de depuración (solo para desarrollo)
        <TouchableOpacity
          style={styles.debugButton}
          onPress={handleDebugResponses}
          disabled={isDebugging}
        >
          <View
            style={[styles.debugButtonInner, { backgroundColor: colors.card }]}
          >
            <MaterialCommunityIcons name="bug" size={18} color={colors.text} />
            <Text style={[styles.debugButtonText, { color: colors.text }]}>
              {isDebugging ? "Depurando..." : "Debug respuestas"}
            </Text>
          </View>
        </TouchableOpacity>

          */}

        {errorMsg && (
          <View
            style={[styles.errorContainer, { borderLeftColor: colors.error }]}
          >
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errorMsg}
            </Text>
          </View>
        )}

        <View style={styles.topSection}>
          <Text
            style={[
              styles.title,
              {
                color: colors.buttonText,
                backgroundColor: colors.tint,
              },
            ]}
          >
            Análisis IA
          </Text>

          {/* Historial dropdown - Envuelto en un View para controlar z-index */}
          <View style={styles.dropdownWrapper}>
            <HistoryDropdown
              dropdownVisible={dropdownVisible}
              historyLoading={historyLoading}
              filteredHistory={filteredHistory}
              selectedAnalysis={selectedAnalysis}
              onToggleDropdown={toggleDropdown}
              onSelectAnalysis={handleSelectAnalysis}
              onViewAllPress={() => {
                setDropdownVisible(false);
                setHistoryVisible(true);
              }}
            />
          </View>
        </View>

        {/* Pantalla de carga durante inicio */}
        {!initialLoadDone && historyLoading ? (
          <View style={styles.loadingContainer}>
            <ProgressLoader
              indeterminate
              label="Cargando análisis..."
              height={8}
              color={colors.tint}
            />
          </View>
        ) : null}

        {/* Sección de análisis */}
        {(analysis || selectedAnalysis) && (
          <AnalysisSection
            analysis={analysis}
            selectedAnalysis={selectedAnalysis}
            fadeAnim={fadeAnim}
            onClearSelection={handleClearSelection}
            onHistoryPress={() => setHistoryVisible(true)}
          />
        )}

        {/* Botón de análisis */}
        <AnalysisButton
          processing={processing}
          buttonScale={buttonScale}
          isDisabled={processing}
          onPress={handleProcessData}
        />

        {/* Modal de historial completo */}
        <HistoryModal
          visible={historyVisible}
          historyLoading={historyLoading}
          filteredHistory={filteredHistory}
          historyFilter={historyFilter}
          selectedAnalysis={selectedAnalysis}
          onClose={() => setHistoryVisible(false)}
          onFilterChange={setHistoryFilter}
          onSelectAnalysis={handleSelectAnalysis}
        />

        {/* Modal de selección de modelo */}

        {/* Mensaje cuando no hay análisis */}
        {!analysis && !selectedAnalysis && !processing && initialLoadDone && (
          <View style={styles.emptyStateContainer}>
            <Text
              style={[styles.emptyStateText, { color: colors.placeholder }]}
            >
              Presiona el botón para generar un análisis de los datos más
              recientes
            </Text>
          </View>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20, // Padding aumentado para más espacio
    paddingBottom: 100,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    zIndex: 10, // Para asegurar que está por encima del contenido
  },
  dropdownWrapper: {
    flex: 1,
    position: "relative",
    marginLeft: 12, // Más espacio
    zIndex: 2000, // z-index elevado para asegurar que está por encima
    elevation: 2000, // Soporte para Android
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontStyle: "italic",
  },
  emptyStateContainer: {
    padding: 32, // Más espacio
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
    borderRadius: 16, // Bordes más redondeados
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24, // Mejor legibilidad
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)", // Color de error más suave
    padding: 14, // Más padding
    borderRadius: 12, // Más redondeado
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "500",
  },
  debugButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1500,
    opacity: 0.8,
  },
  debugButtonInner: {
    paddingVertical: 8, // Más padding
    paddingHorizontal: 14, // Más padding
    borderRadius: 20, // Muy redondeado para aspecto moderno
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugButtonText: {
    fontSize: 13,
    fontWeight: "500", // Más bold
    marginLeft: 6,
  },
  title: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
});

export default AIAnalysisDisplay;
