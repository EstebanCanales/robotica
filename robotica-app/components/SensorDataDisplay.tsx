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

// Opciones de filtro de tiempo
type TimeFilter = "24h" | "semana" | "mes" | "todo";

/**
 * Componente para mostrar datos de los sensores
 */
const SensorDataDisplay = () => {
  // Usar el hook personalizado
  const {
    isLoading,
    refreshing,
    data: allSensorData,
    error,
    refreshData,
    loadData,
  } = useSensorData(true, 15); // Aumentamos el límite para tener más datos para filtrar

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
        <Text style={styles.valueLabel}>{label}:</Text>
        <Text style={styles.value}>
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
        <Text style={styles.sectionTitle}>{title}</Text>
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
      <View key={record.id || index} style={styles.dataCard}>
        <View style={styles.timestampContainer}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.timestamp}>
            {formattedDate} - {formattedTime}
          </Text>
        </View>

        {renderSensorSection("Sensor BMP390", record.sensor_bmp390)}
        {renderSensorSection("Sensor LTR390", record.sensor_ltr390)}
        {renderSensorSection("Sensor SCD30", record.sensor_scd30)}

        {record.gps && (
          <View style={styles.sensorSection}>
            <Text style={styles.sectionTitle}>GPS</Text>
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
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por tiempo:</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              timeFilter === "24h" && styles.filterOptionActive,
            ]}
            onPress={() => handleTimeFilterChange("24h")}
          >
            <Text
              style={[
                styles.filterText,
                timeFilter === "24h" && styles.filterTextActive,
              ]}
            >
              24h
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              timeFilter === "semana" && styles.filterOptionActive,
            ]}
            onPress={() => handleTimeFilterChange("semana")}
          >
            <Text
              style={[
                styles.filterText,
                timeFilter === "semana" && styles.filterTextActive,
              ]}
            >
              Semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              timeFilter === "mes" && styles.filterOptionActive,
            ]}
            onPress={() => handleTimeFilterChange("mes")}
          >
            <Text
              style={[
                styles.filterText,
                timeFilter === "mes" && styles.filterTextActive,
              ]}
            >
              Mes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              timeFilter === "todo" && styles.filterOptionActive,
            ]}
            onPress={() => handleTimeFilterChange("todo")}
          >
            <Text
              style={[
                styles.filterText,
                timeFilter === "todo" && styles.filterTextActive,
              ]}
            >
              Todo
            </Text>
          </TouchableOpacity>
        </View>

        {filteredData.length > 0 && (
          <View style={styles.filterInfoContainer}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.filterInfoText}>{getFilterInfo()}</Text>
          </View>
        )}

        <View style={styles.filterStatsContainer}>
          <Text style={styles.filterStatsText}>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0057A3" />
        <Text style={styles.loadingText}>Cargando datos de sensores...</Text>
      </View>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.errorContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          Desliza hacia abajo para intentar de nuevo
        </Text>
      </ScrollView>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!allSensorData || allSensorData.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        <Text style={styles.emptyText}>No hay datos disponibles</Text>
        <Text style={styles.emptySubtext}>
          Desliza hacia abajo para actualizar
        </Text>
      </ScrollView>
    );
  }

  // Renderizar listado de datos
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={["#0057A3"]}
        />
      }
    >
      <Text style={styles.sectionHeader}>Datos de sensores</Text>
      {renderTimeFilters()}

      {filteredData.map((record, index) => renderDataRecord(record, index))}

      {filteredData.length === 0 && !isLoading && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No hay datos para el período seleccionado
          </Text>
        </View>
      )}

      {timeFilter === "todo" && allSensorData.length >= 10 && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={styles.loadMoreText}>Cargar más registros</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Mostrando {filteredData.length} registro(s)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfbfb",
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbfbfb",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fbfbfb",
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fbfbfb",
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0057A3",
  },
  filterContainer: {
    backgroundColor: "#fff",
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
    color: "#333",
  },
  filterOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  filterOptionActive: {
    backgroundColor: "#0057A3",
  },
  filterText: {
    fontSize: 14,
    color: "#333",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  dataCard: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#eee",
  },
  timestamp: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  sensorSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0057A3",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    color: "#555",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  noDataContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  noDataText: {
    color: "#666",
    fontSize: 16,
  },
  loadMoreButton: {
    backgroundColor: "#0057A3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  filterInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  filterInfoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  filterStatsContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  filterStatsText: {
    fontSize: 13,
    color: "#0057A3",
    fontWeight: "500",
  },
});

export default SensorDataDisplay;
