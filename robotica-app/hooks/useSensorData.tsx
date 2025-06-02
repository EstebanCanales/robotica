import { useState, useEffect, useCallback } from "react";
import {
  dataAnalysisService,
  SensorDataRecord,
  AnalysisResult,
  ModelInfo,
  ModelList,
} from "@/services/DataAnalysisService";

interface SensorDataState {
  isLoading: boolean;
  refreshing: boolean;
  data: SensorDataRecord[];
  analysis: AnalysisResult | null;
  error: string | null;
  // Modelos de IA
  modelos: ModelInfo[];
  modeloActivo: string;
  isLoadingModels: boolean;
  isChangingModel: boolean;
  // Funciones
  loadData: (limit?: number) => Promise<void>;
  refreshData: () => Promise<void>;
  processData: () => Promise<void>;
  loadModels: () => Promise<void>;
  changeModel: (
    modelName: string
  ) => Promise<{ mensaje: string; modelo: string }>;
  // Historial de análisis
  getAnalysisHistory: (limit?: number) => Promise<AnalysisResult[]>;
}

/**
 * Hook personalizado para gestionar datos de sensores y análisis
 * @param initialLoad Indica si debe cargar datos automáticamente al montar
 * @param initialLimit Número inicial de registros a cargar
 * @returns Estado y funciones para gestionar datos de sensores
 */
export function useSensorData(
  initialLoad: boolean = true,
  initialLimit: number = 5
): SensorDataState {
  // Estados para datos de sensores
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [data, setData] = useState<SensorDataRecord[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados para modelos de IA
  const [modelos, setModelos] = useState<ModelInfo[]>([]);
  const [modeloActivo, setModeloActivo] = useState<string>("");
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [isChangingModel, setIsChangingModel] = useState<boolean>(false);

  // Cargar datos
  const loadData = useCallback(
    async (limit: number = initialLimit) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`[useSensorData] Cargando ${limit} registros de datos`);
        const response = await dataAnalysisService.getSensorData(limit);

        setData(response.data);
        console.log(
          `[useSensorData] ${response.data.length} registros cargados correctamente`
        );
      } catch (err) {
        console.error("[useSensorData] Error al cargar datos:", err);
        setError("No se pudieron cargar los datos de sensores");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [initialLimit]
  );

  // Refrescar datos (para pull-to-refresh)
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  // Procesar datos para análisis
  const processData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("[useSensorData] Procesando datos para análisis");
      const result = await dataAnalysisService.procesarDatos();

      setAnalysis(result);
      console.log("[useSensorData] Análisis completado:", result.response_id);

      // Refrescar datos después de procesar
      await loadData();
    } catch (err) {
      console.error("[useSensorData] Error al procesar datos:", err);
      setError("No se pudieron procesar los datos");
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // Cargar modelos de IA disponibles
  const loadModels = useCallback(async () => {
    try {
      setIsLoadingModels(true);
      console.log("[useSensorData] Cargando modelos disponibles");

      const modelList = await dataAnalysisService.obtenerModelos();
      setModelos(modelList.modelos);

      // Actualizar el modelo activo solo si tenemos uno nuevo
      if (modelList.modelo_activo) {
        setModeloActivo(modelList.modelo_activo);
      }

      console.log(
        "[useSensorData] Modelos cargados. Activo:",
        modelList.modelo_activo
      );
    } catch (err) {
      console.error("[useSensorData] Error al cargar modelos:", err);
      // No establecemos error global para no afectar la UI principal
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  // Cambiar modelo activo
  const changeModel = useCallback(
    async (modelName: string) => {
      if (modelName === modeloActivo) {
        return { mensaje: "Este modelo ya está activo", modelo: modelName };
      }

      try {
        setIsChangingModel(true);
        console.log(`[useSensorData] Cambiando a modelo: ${modelName}`);

        const response = await dataAnalysisService.cambiarModelo(modelName);

        // Actualizar inmediatamente el modelo activo para reflejar el cambio en la UI
        setModeloActivo(modelName);

        // Actualizar la lista de modelos para reflejar el cambio
        await loadModels();

        console.log("[useSensorData] Modelo cambiado exitosamente");
        return response;
      } catch (err) {
        console.error(
          `[useSensorData] Error al cambiar al modelo ${modelName}:`,
          err
        );
        throw err;
      } finally {
        setIsChangingModel(false);
      }
    },
    [modeloActivo, loadModels]
  );

  // Obtener historial de análisis
  const getAnalysisHistory = useCallback(async (limit: number = 10) => {
    try {
      console.log(
        `[useSensorData] Obteniendo historial de análisis (${limit} registros)`
      );
      const responses = await dataAnalysisService.obtenerRespuestas(limit);

      // Transformar respuestas al formato AnalysisResult
      const analysisHistory: AnalysisResult[] = responses.map((response) => ({
        message: response.message || "Análisis completado",
        data_id: response.data_id,
        response_id: response.response_id,
        response: response.response,
        timestamp: response.timestamp,
      }));

      return analysisHistory;
    } catch (err) {
      console.error("[useSensorData] Error al obtener historial:", err);
      return [];
    }
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (initialLoad) {
      loadData();
      loadModels(); // También cargamos los modelos al inicializar
    } else {
      setIsLoading(false);
    }
  }, [initialLoad, loadData, loadModels]);

  return {
    isLoading,
    refreshing,
    data,
    analysis,
    error,
    modelos,
    modeloActivo,
    isLoadingModels,
    isChangingModel,
    loadData,
    refreshData,
    processData,
    loadModels,
    changeModel,
    getAnalysisHistory,
  };
}

export default useSensorData;
