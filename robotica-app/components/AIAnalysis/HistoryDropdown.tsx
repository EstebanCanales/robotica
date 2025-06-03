import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AnalysisResult } from "@/services/DataAnalysisService";
import FuturisticLoader from "./FuturisticLoader";
import AnimatedLoadingText from "./AnimatedLoadingText";
import { Colors } from "@/constants/Colors";
import { useThemeContext } from "@/hooks/ThemeContext";

interface HistoryDropdownProps {
  dropdownVisible: boolean;
  historyLoading: boolean;
  filteredHistory: AnalysisResult[];
  selectedAnalysis: AnalysisResult | null;
  onToggleDropdown: () => void;
  onSelectAnalysis: (analysis: AnalysisResult) => void;
  onViewAllPress: () => void;
}

const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  dropdownVisible,
  historyLoading,
  filteredHistory,
  selectedAnalysis,
  onToggleDropdown,
  onSelectAnalysis,
  onViewAllPress,
}) => {
  const { theme } = useThemeContext();
  const colors = Colors[theme];

  // Limitar a los 5 análisis más recientes para el dropdown
  const displayItems = useMemo(() => {
    return filteredHistory.slice(0, 5);
  }, [filteredHistory]);

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

  // Extraer título de forma simple y directa
  const getTitle = (item: AnalysisResult): string => {
    // Si hay una respuesta como string
    if (typeof item.response === "string" && item.response.trim()) {
      const lines = item.response.trim().split("\n");
      if (lines.length > 0) {
        // Quitar marcadores markdown de título
        const title = lines[0].replace(/^#+\s*/, "").trim();
        return title.length > 25 ? title.substring(0, 25) + "..." : title;
      }
    }

    // Si es un objeto
    if (item.response && typeof item.response === "object") {
      return "Análisis JSON";
    }

    // Si hay mensaje
    if (typeof item.message === "string" && item.message.trim()) {
      const title = item.message.trim();
      return title.length > 25 ? title.substring(0, 25) + "..." : title;
    }

    return "Análisis de datos";
  };

  // Formatear fecha de manera segura
  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return "Fecha desconocida";

    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Intentar formato epoch
        if (!isNaN(Number(timestamp))) {
          const epochDate = new Date(
            Number(timestamp) * (timestamp.length <= 10 ? 1000 : 1)
          );
          if (!isNaN(epochDate.getTime())) {
            return epochDate.toLocaleDateString();
          }
        }
        return "Fecha inválida";
      }
      return date.toLocaleDateString();
    } catch (e) {
      return "Error de formato";
    }
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, { borderColor: colors.border }]}
        onPress={onToggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownButtonText, { color: colors.tint }]}>
          Análisis previos
        </Text>
        <MaterialCommunityIcons
          name={dropdownVisible ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.tint}
        />
      </TouchableOpacity>

      {dropdownVisible && (
        <View style={[styles.dropdownOverlay]}>
          <Animated.View
            style={[
              styles.dropdownMenu,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {historyLoading ? (
              <View style={styles.dropdownLoadingContainer}>
                <FuturisticLoader size={20} color={colors.tint} />
                <AnimatedLoadingText
                  text="Cargando análisis"
                  color={colors.text}
                />
              </View>
            ) : displayItems.length === 0 ? (
              <Text
                style={[
                  styles.dropdownEmptyText,
                  { color: colors.placeholder },
                ]}
              >
                No hay análisis previos
              </Text>
            ) : (
              <ScrollView
                style={styles.dropdownScrollView}
                showsVerticalScrollIndicator={true}
                bounces={true}
                nestedScrollEnabled={true}
              >
                {displayItems.map((item, index) => {
                  const title = getTitle(item);
                  const date = formatDate(item.timestamp);
                  const isSelected = isItemSelected(item);

                  return (
                    <TouchableOpacity
                      key={`dropdown-${
                        item.response_id || item.data_id || index
                      }-${index}`}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: colors.border },
                        isSelected && [
                          styles.dropdownItemSelected,
                          { backgroundColor: `${colors.tint}10` },
                        ],
                      ]}
                      onPress={() => onSelectAnalysis(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dropdownItemTextContainer}>
                        <Text
                          style={[
                            styles.dropdownItemTitle,
                            { color: isSelected ? colors.tint : colors.text },
                          ]}
                          numberOfLines={1}
                        >
                          {title}
                        </Text>
                        <Text
                          style={[
                            styles.dropdownItemDate,
                            { color: colors.placeholder },
                          ]}
                        >
                          {date}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={16}
                        color={colors.tint}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[
                styles.dropdownViewAllButton,
                { backgroundColor: `${colors.tint}10` },
              ]}
              onPress={onViewAllPress}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.dropdownViewAllText, { color: colors.tint }]}
              >
                Ver todos los análisis
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={colors.tint}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    marginTop: 2,
    width: "100%",
    position: "relative",
    zIndex: 1000, // Aumentado para estar siempre por encima
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    padding: 14, // Padding más grande para mejor toque
    borderRadius: 12, // Más redondeado para estilo moderno
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Overlay para cubrir toda la pantalla y asegurarse que el dropdown esté por encima
  dropdownOverlay: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 1000, // Aumentado para asegurar que está encima
    elevation: 1000, // Para Android
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  dropdownMenu: {
    borderRadius: 12, // Más redondeado para diseño moderno
    marginTop: 8, // Más separación del botón
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    maxHeight: 400, // Limitar altura para móviles pequeños
    overflow: "hidden", // Asegurar que nada sobresalga del borde redondeado
  },
  dropdownScrollView: {
    maxHeight: 300, // Limitar altura para que no ocupe toda la pantalla
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14, // Padding más grande
    borderBottomWidth: 1,
  },
  dropdownItemSelected: {
    borderLeftWidth: 3, // Barra lateral para indicar selección
    paddingLeft: 11, // Compensar la barra lateral
  },
  dropdownItemTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownItemDate: {
    fontSize: 12,
    marginTop: 2,
  },
  dropdownLoadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  dropdownEmptyText: {
    padding: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  dropdownViewAllButton: {
    flexDirection: "row",
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  dropdownViewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HistoryDropdown;
