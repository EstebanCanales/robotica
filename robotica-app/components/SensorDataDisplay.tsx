import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SensorDataRecord } from "@/services/DataAnalysisService";
import useSensorData from "@/hooks/useSensorData";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";

// Opciones de filtro de tiempo
type TimeFilter = "24h" | "semana" | "mes" | "todo";

/**
 * Componente para mostrar datos de los sensores
 */
const SensorDataDisplay = () => {
  // Tema
  const { theme } = useThemeContext();
  const colors = Colors[theme];

  // Usar el hook personalizado
  const {
    isLoading,
    refreshing,
    data: allSensorData,
    error,
    refreshData,
    loadData,
  } = useSensorData(true, 30); // Aumentamos el límite para tener más datos para filtrar

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");
  const [filteredData, setFilteredData] = useState<SensorDataRecord[]>([]);

  // Filtrar datos por tiempo seleccionado
  useEffect(() => {
    if (!allSensorData || allSensorData.length === 0) {
      setFilteredData([]);
      return;
    }

    const now = new Date();
    let filterDate = new Date();

    switch (timeFilter) {
      case "24h":
        filterDate.setHours(now.getHours() - 24);
        break;
      case "semana":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "mes":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "todo":
      default:
        // No establecer fecha límite
        setFilteredData(allSensorData);
        return;
    }

    const filtered = allSensorData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= filterDate;
    });

    // Ordenar de más reciente a más antiguo
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setFilteredData(filtered);
  }, [timeFilter, allSensorData]);

  // Manejar cambio de filtro de tiempo
  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
  };

  // Recargar con más registros
  const handleLoadMore = async () => {
    await loadData(30); // Cargar más registros
  };

  // Renderizar un valor con etiqueta
  const renderValue = (label: string, value: any, unit: string = "") => {
    if (value === undefined || value === null) {
      return null;
    }

    return (
      <View key={label} style={styles.valueContainer}>
        <Text style={[styles.valueLabel, { color: colors.placeholder }]}>
          {label}:
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {value} {unit}
        </Text>
      </View>
    );
  };

  // Renderizar una sección de sensor
  const renderSensorSection = (title: string, data: any) => {
    if (!data) return null;

    return (
      <View style={styles.sensorSection}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.tint, borderBottomColor: colors.border },
          ]}
        >
          {title}
        </Text>
        <View style={styles.sensorValues}>
          {Object.entries(data).map(([key, value]: [string, any]) =>
            // Decidir la unidad basada en el nombre de la clave
            renderValue(
              key,
              value,
              key.includes("temperatura")
                ? "°C"
                : key.includes("humedad")
                ? "%"
                : key.includes("presion")
                ? "hPa"
                : ""
            )
          )}
        </View>
      </View>
    );
  };

  // Renderizar un registro de datos
  const renderDataRecord = (record: SensorDataRecord, index: number) => {
    if (!record) return null;

    // Formatear fecha/hora para mostrar
    const recordDate = new Date(record.timestamp);
    const formattedDate = recordDate.toLocaleDateString();
    const formattedTime = recordDate.toLocaleTimeString();

    return (
      <View
        key={record.id || index}
        style={[
          styles.dataCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.timestampContainer,
            { borderBottomColor: colors.border },
          ]}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={colors.placeholder}
          />
          <Text style={[styles.timestamp, { color: colors.placeholder }]}>
            {formattedDate} - {formattedTime}
          </Text>
        </View>

        {renderSensorSection("Sensor BMP390", record.sensor_bmp390)}
        {renderSensorSection("Sensor LTR390", record.sensor_ltr390)}
        {renderSensorSection("Sensor SCD30", record.sensor_scd30)}

        {record.gps && (
          <View style={styles.sensorSection}>
            <Text style={[styles.sectionTitle, { color: colors.tint }]}>
              GPS
            </Text>
            <View style={styles.sensorValues}>
              {renderValue("Latitud", record.gps.latitud)}
              {renderValue("Longitud", record.gps.longitud)}
            </View>
          </View>
        )}
      </View>
    );
  };

  // Renderizar filtros de tiempo
  const renderTimeFilters = () => {
    // Obtener información sobre los datos filtrados
    const getFilterInfo = () => {
      if (!filteredData || filteredData.length === 0) {
        return "No hay datos para mostrar";
      }

      // Si tenemos datos, mostrar el rango de fechas
      if (filteredData.length > 0) {
        // Ordenar por fecha
        const sortedData = [...filteredData].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Obtener primera y última fecha
        const firstDate = new Date(sortedData[0].timestamp);
        const lastDate = new Date(sortedData[sortedData.length - 1].timestamp);

        // Formatear para mostrar
        const formatDate = (date: Date) => {
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
        };

        return `Mostrando registros desde ${formatDate(
          firstDate
        )} hasta ${formatDate(lastDate)}`;
      }

      return "";
    };

    return (
      <View
        style={[
          styles.filterContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.filterLabel, { color: colors.text }]}>
          Filtrar por tiempo:
        </Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              { backgroundColor: colors.border },
              timeFilter === "24h" && { backgroundColor: colors.tint },
            ]}
            onPress={() => handleTimeFilterChange("24h")}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.text },
                timeFilter === "24h" && { color: colors.buttonText },
              ]}
            >
              24h
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              { backgroundColor: colors.border },
              timeFilter === "semana" && { backgroundColor: colors.tint },
            ]}
            onPress={() => handleTimeFilterChange("semana")}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.text },
                timeFilter === "semana" && { color: colors.buttonText },
              ]}
            >
              Semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              { backgroundColor: colors.border },
              timeFilter === "mes" && { backgroundColor: colors.tint },
            ]}
            onPress={() => handleTimeFilterChange("mes")}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.text },
                timeFilter === "mes" && { color: colors.buttonText },
              ]}
            >
              Mes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              { backgroundColor: colors.border },
              timeFilter === "todo" && { backgroundColor: colors.tint },
            ]}
            onPress={() => handleTimeFilterChange("todo")}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.text },
                timeFilter === "todo" && { color: colors.buttonText },
              ]}
            >
              Todo
            </Text>
          </TouchableOpacity>
        </View>

        {filteredData.length > 0 && (
          <View
            style={[
              styles.filterInfoContainer,
              { borderTopColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={colors.placeholder}
            />
            <Text
              style={[styles.filterInfoText, { color: colors.placeholder }]}
            >
              {getFilterInfo()}
            </Text>
          </View>
        )}

        <View style={styles.filterStatsContainer}>
          <Text style={[styles.filterStatsText, { color: colors.tint }]}>
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "registro" : "registros"} encontrado
            {filteredData.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    );
  };

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Cargando datos de sensores...
        </Text>
      </View>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.errorContainer,
          { backgroundColor: colors.background },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={[colors.tint]}
          />
        }
      >
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <Text style={[styles.errorSubtext, { color: colors.placeholder }]}>
          Desliza hacia abajo para intentar de nuevo
        </Text>
      </ScrollView>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!allSensorData || allSensorData.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.emptyContainer,
          { backgroundColor: colors.background },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={[colors.tint]}
          />
        }
      >
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No hay datos disponibles
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.placeholder }]}>
          Desliza hacia abajo para actualizar
        </Text>
      </ScrollView>
    );
  }

  // Renderizar listado de datos
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={[colors.tint]}
        />
      }
    >
      <Text style={[styles.sectionHeader, { color: colors.tint }]}>
        Datos de sensores
      </Text>
      {renderTimeFilters()}

      {filteredData.map((record, index) => renderDataRecord(record, index))}

      {filteredData.length === 0 && !isLoading && (
        <View
          style={[styles.noDataContainer, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.noDataText, { color: colors.placeholder }]}>
            No hay datos para el período seleccionado
          </Text>
        </View>
      )}

      {timeFilter === "todo" && allSensorData.length >= 10 && (
        <TouchableOpacity
          style={[styles.loadMoreButton, { backgroundColor: colors.tint }]}
          onPress={handleLoadMore}
        >
          <Text style={[styles.loadMoreText, { color: colors.buttonText }]}>
            Cargar más registros
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.placeholder }]}>
          Mostrando {filteredData.length} registro(s)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
  },
  dataCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  timestamp: {
    fontSize: 14,
    marginLeft: 6,
  },
  sensorSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  sensorValues: {
    paddingHorizontal: 8,
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  valueLabel: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  noDataContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
  },
  loadMoreButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  loadMoreText: {
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
  },
  filterInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  filterInfoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  filterStatsContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  filterStatsText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default SensorDataDisplay;
