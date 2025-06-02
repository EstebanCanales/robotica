import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/Api';

// Datos ficticios para cuando no hay conexión con el backend
const MOCK_DATA = {
  // Datos ficticios de sensores
  sensorData: {
    message: "Datos de prueba cargados correctamente",
    count: 15,
    data: Array(15).fill(null).map((_, index) => ({
      id: index + 1,
      record_id: index + 100,
      timestamp: new Date(Date.now() - index * 1000 * 60 * 10).toISOString(),
      sensor_bmp390: {
        presion_hPa: 1013 + Math.random() * 5,
        temperatura_a: 22 + Math.random() * 5,
      },
      sensor_ltr390: {
        luz_cruda: 2000 + Math.random() * 1000,
        uv_crudo: 10 + Math.random() * 5,
        lux: 500 + Math.random() * 200,
        indice_uv: 2 + Math.random() * 3,
      },
      sensor_scd30: {
        co2_ppm: 400 + Math.random() * 200,
        temperatura_b: 23 + Math.random() * 3,
        humedad_pct: 40 + Math.random() * 20,
      }
    }))
  },
  // Datos ficticios para respuestas de análisis
  analysisResponse: {
    message: "Análisis completado con éxito",
    data_id: 1,
    response_id: 1,
    response: `# Análisis de Datos Ambientales

## Resumen de Condiciones

Las lecturas de los sensores muestran condiciones ambientales estables. La temperatura promedio es de 23.5°C con humedad del 45%, dentro del rango óptimo para ambientes interiores. Los niveles de CO₂ se mantienen en 428ppm, indicando buena ventilación.

## Observaciones 

- **Temperatura**: Estable entre 22-25°C, ideal para confort humano
- **Humedad**: 45% (óptima para prevenir microorganismos)
- **Presión atmosférica**: 1014 hPa, indicando estabilidad barométrica
- **Luz UV**: Índice 3.5 (moderado), recomendable protección solar ligera
- **CO₂**: 428ppm, excelente calidad de aire interior

## Recomendaciones

1. Mantener la ventilación actual para conservar niveles óptimos de CO₂
2. Considerar protección UV en exteriores durante las horas pico
3. No es necesario ajustar sistemas de climatización

*Análisis generado por IA: modelo ambiental v2.1*`,
    timestamp: new Date().toISOString(),
  },
  // Datos ficticios para el historial de análisis
  analysisHistory: Array(5).fill(null).map((_, index) => ({
    response_id: index + 1,
    data_id: index + 1,
    message: `Análisis histórico #${index + 1}`,
    timestamp: new Date(Date.now() - index * 1000 * 60 * 60 * 24).toISOString(),
    response: `# Análisis de Datos ${index + 1}\n\nLas condiciones ambientales muestran que la temperatura es de ${20 + Math.random() * 5}°C con humedad relativa del ${40 + Math.random() * 20}%.\n\nLos niveles de CO₂ están en ${400 + Math.random() * 200}ppm, dentro de parámetros normales.`
  })),
  // Datos ficticios para modelos
  models: {
    modelos: [
      { nombre: "gpt-3.5-turbo", activo: false, detalles: { descripcion: "Modelo de OpenAI para respuestas rápidas" } },
      { nombre: "gpt-4", activo: true, detalles: { descripcion: "Modelo avanzado de OpenAI con mejor comprensión" } },
      { nombre: "claude-instant", activo: false, detalles: { descripcion: "Modelo de Anthropic de respuesta rápida" } },
      { nombre: "claude-2", activo: false, detalles: { descripcion: "Modelo avanzado de Anthropic" } },
    ],
    modelo_activo: "gpt-4"
  }
};

// Utilidad de logging detallado
const logDetailed = (prefix: string, data: any): void => {
  console.log(`\n=================== ${prefix} ===================`);
  if (data === null) {
    console.log(`[DETALLE] Valor null`);
  } else if (data === undefined) {
    console.log(`[DETALLE] Valor undefined`);
  } else if (typeof data === 'object') {
    console.log(`[DETALLE] Tipo: ${Array.isArray(data) ? 'Array' : 'Object'}`);
    
    if (Array.isArray(data)) {
      console.log(`[DETALLE] Longitud del array: ${data.length}`);
      if (data.length > 0) {
        console.log(`[DETALLE] Primer elemento: `, JSON.stringify(data[0], null, 2));
      }
    } else {
      console.log(`[DETALLE] Claves: ${Object.keys(data).join(', ')}`);
      
      // Si tiene una propiedad 'response', examinarla
      if ('response' in data) {
        console.log(`[DETALLE] Tiene propiedad 'response'`);
        const responseValue = data.response;
        if (responseValue === null) {
          console.log(`[DETALLE] response: null`);
        } else if (responseValue === undefined) {
          console.log(`[DETALLE] response: undefined`);
        } else if (typeof responseValue === 'object') {
          console.log(`[DETALLE] response es un objeto: ${JSON.stringify(responseValue, null, 2)}`);
        } else {
          console.log(`[DETALLE] response es ${typeof responseValue}`);
          if (typeof responseValue === 'string') {
            console.log(`[DETALLE] Primeros 150 caracteres: ${responseValue.substring(0, 150)}...`);
          }
        }
      }
      
      // Si tiene una propiedad 'message'
      if ('message' in data) {
        console.log(`[DETALLE] message: ${data.message}`);
      }
    }
  } else {
    console.log(`[DETALLE] Valor simple tipo ${typeof data}: ${data}`);
  }
  console.log(`=================== FIN ${prefix} ===================\n`);
};

// Tipos para las respuestas de la API
export interface SensorDataRecord {
  id: number;
  timestamp: string;
  record_id: number;
  sensor_bmp390?: {
    presion_hPa: number;
    temperatura_a: number;
  };
  sensor_ltr390?: {
    luz_cruda: number;
    uv_crudo: number;
    lux: number;
    indice_uv: number;
  };
  sensor_scd30?: {
    co2_ppm: number | null;
    temperatura_b: number | null;
    humedad_pct: number | null;
  };
  gps?: {
    latitud: number;
    longitud: number;
  };
  clima_satelital?: {
    T2M: number;
    T2M_MAX: number;
    T2M_MIN: number;
    T2M_RANGE: number;
    PRECTOTCORR: number;
    RH2M: number;
    QV2M: number;
    WS10M: number;
    WS10M_MAX: number;
    WS10M_MIN: number;
    T2MDEW: number;
    T2MWET: number;
    TS: number;
    ALLSKY_SFC_LW_DWN: number;
    ALLSKY_SFC_SW_DWN: number;
    CLRSKY_SFC_SW_DWN: number;
    ALLSKY_KT: number;
    EVLAND: number;
    PS: number;
  };
}

export interface SensorDataResponse {
  message: string;
  count: number;
  data: SensorDataRecord[];
}

export interface AnalysisResult {
  message?: string;
  data_id?: number;
  response_id?: number;
  response?: string | Record<string, any>;
  timestamp?: string;
  content?: string | Record<string, any>;
  result?: string | Record<string, any>;
}

export interface ModelInfo {
  nombre: string;
  activo: boolean;
  detalles: Record<string, any>;
}

export interface ModelList {
  modelos: ModelInfo[];
  modelo_activo: string;
}

/**
 * Servicio para interactuar con el componente data-analysis
 */
class DataAnalysisService {
  private api: AxiosInstance;
  private usesMockData: boolean = false;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // 60 segundos para permitir que el modelo de IA tenga tiempo de procesar
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Configurar interceptores para logging y manejo de errores
    this.setupInterceptors();
  }

  /**
   * Configurar interceptores para logging y manejo de errores
   */
  private setupInterceptors() {
    // Interceptor de solicitudes
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[DataAnalysis] Solicitud: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('[DataAnalysis] Error en solicitud:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de respuestas
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[DataAnalysis] Respuesta: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          // La solicitud fue realizada y el servidor respondió con un código de estado
          console.error(`[DataAnalysis] Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
          // La solicitud fue realizada pero no se recibió respuesta
          console.error('[DataAnalysis] Sin respuesta:', error.request);
        } else {
          // Error en la configuración de la solicitud
          console.error('[DataAnalysis] Error de configuración:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Normaliza una respuesta de análisis para asegurar un formato consistente
   * y extraer correctamente el contenido markdown
   */
  private normalizeAnalysisResult(rawResponse: any): AnalysisResult {
    // Si es null o undefined, devolver un objeto vacío
    if (!rawResponse) {
      console.warn('[DataAnalysis] La respuesta es null o undefined');
      return {};
    }

    try {
      // Debug para ver la estructura exacta de la respuesta
      logDetailed('NORMALIZACIÓN', rawResponse);

      // 1. Extraer el ID - buscando en múltiples posibles campos
      const response_id = 
        rawResponse.response_id !== undefined ? Number(rawResponse.response_id) : 
        rawResponse.id !== undefined ? Number(rawResponse.id) :
        undefined;
      
      // 2. Extraer el data_id si existe
      const data_id = 
        rawResponse.data_id !== undefined ? Number(rawResponse.data_id) :
        undefined;

      // 3. Obtener mensaje si existe
      const message = rawResponse.message || undefined;

      // 4. Normalizar timestamp - examinando múltiples posibles campos
      let timestamp = 
        rawResponse.timestamp || 
        rawResponse.created_at ||
        rawResponse.date || 
        new Date().toISOString();

      // Asegurarse que el timestamp esté en formato ISO
      try {
        // Verificar si es un número (epoch)
        if (timestamp && !isNaN(Number(timestamp))) {
          const epochTimestamp = Number(timestamp);
          const date = new Date(epochTimestamp * (String(epochTimestamp).length <= 10 ? 1000 : 1));
          timestamp = date.toISOString();
        } 
        // Validar que sea una fecha válida
        else if (timestamp) {
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            timestamp = date.toISOString();
          } else {
            console.warn('[DataAnalysis] Timestamp inválido, usando fecha actual:', timestamp);
            timestamp = new Date().toISOString();
          }
        }
      } catch (e) {
        console.error('[DataAnalysis] Error procesando timestamp:', e);
        timestamp = new Date().toISOString();
      }

      // 5. Extraer respuesta - probando múltiples campos posibles
      let response = 
        rawResponse.result ||
        rawResponse.content ||
        rawResponse.response;

      // Si response tiene una propiedad 'response' interna (caso de respuesta anidada)
      if (response && typeof response === 'object' && 'response' in response) {
        console.log('[DataAnalysis] Detectada respuesta anidada, extrayendo contenido interno');
        response = response.response;
      }
      
      // Si sigue siendo un objeto con data o content, extraer
      if (response && typeof response === 'object') {
        if ('data' in response) {
          response = response.data;
        } else if ('content' in response) {
          response = response.content;
        } else if ('result' in response) {
          response = response.result;
        }
      }

      // Si no se encontró contenido en response, pero existe data.result, usar ese
      if (!response && rawResponse.data && rawResponse.data.result) {
        response = rawResponse.data.result;
      }

      const result = {
        response_id,
        data_id,
        message,
        response,
        timestamp
      };

      // Registrar el resultado normalizado
      logDetailed('RESULTADO NORMALIZADO', result);
      
      return result;
    } catch (error) {
      console.error('[DataAnalysis] Error normalizando respuesta:', error);
      // En caso de error, devolver el objeto original o un objeto vacío
      return rawResponse || {}; 
    }
  }

  /**
   * Obtiene los datos más recientes de los sensores
   * @param limit Número máximo de registros a obtener
   * @returns Lista de datos de sensores
   */
  async getSensorData(limit = 5): Promise<SensorDataResponse> {
    try {
      const response = await this.api.get<SensorDataResponse>(
        API_ENDPOINTS.sensorData, 
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      console.error('[DataAnalysis] Error al obtener datos de sensores:', error);
      console.warn('[DataAnalysis] Usando datos ficticios para sensores');
      this.usesMockData = true;
      
      // Devuelve datos ficticios pero limita al número solicitado
      const mockResponse = {...MOCK_DATA.sensorData};
      mockResponse.data = mockResponse.data.slice(0, limit);
      mockResponse.count = mockResponse.data.length;
      return mockResponse;
    }
  }

  /**
   * Procesa los datos con el modelo de IA para obtener un análisis
   * @returns Resultado del análisis
   */
  async procesarDatos(): Promise<AnalysisResult> {
    try {
      console.log('[DataAnalysis] Iniciando procesamiento de datos (puede tomar hasta 60 segundos)...');
      const response = await this.api.get<any>(API_ENDPOINTS.procesarDatos);
      logDetailed('PROCESAR DATOS - RESPUESTA', response.data);
      return this.normalizeAnalysisResult(response.data);
    } catch (error) {
      console.error('[DataAnalysis] Error al procesar datos:', error);
      console.warn('[DataAnalysis] Usando datos ficticios para análisis');
      this.usesMockData = true;
      return MOCK_DATA.analysisResponse;
    }
  }

  /**
   * Obtiene la lista de respuestas de análisis previos
   * @param limit Número máximo de respuestas a obtener
   * @returns Lista de respuestas previas normalizada
   */
  async obtenerRespuestas(limit = 30): Promise<AnalysisResult[]> {
    try {
      console.log(`[DataAnalysis] Obteniendo hasta ${limit} respuestas previas...`);
      const response = await this.api.get<any[]>(
        API_ENDPOINTS.respuestas,
        { params: { limit } }
      );
      
      // Mostrar la respuesta completa
      logDetailed('RESPUESTAS COMPLETAS', response.data);
      
      // Verificar que la respuesta sea un array
      if (!Array.isArray(response.data)) {
        console.error('[DataAnalysis] La respuesta no es un array:', response.data);
        return [];
      }

      // Analizar cada respuesta individualmente
      console.log('\n=== ANALIZANDO CADA RESPUESTA INDIVIDUALMENTE ===');
      const normalizedResponses = response.data.map((item, index) => {
        console.log(`\n----- RESPUESTA #${index + 1} -----`);
        logDetailed(`RESPUESTA #${index + 1}`, item);
        const normalized = this.normalizeAnalysisResult(item);
        return normalized;
      });
      
      console.log(`\n[DataAnalysis] Se normalizaron ${normalizedResponses.length} respuestas`);
      
      return normalizedResponses;
    } catch (error) {
      console.error('[DataAnalysis] Error al obtener respuestas:', error);
      console.warn('[DataAnalysis] Usando datos ficticios para historial de análisis');
      this.usesMockData = true;
      return MOCK_DATA.analysisHistory.slice(0, limit);
    }
  }

  /**
   * Obtiene una respuesta específica por su ID
   * @param id ID de la respuesta
   * @returns Detalles de la respuesta normalizada
   */
  async obtenerRespuestaPorId(id: number): Promise<AnalysisResult> {
    try {
      console.log(`[DataAnalysis] Obteniendo respuesta con ID ${id}...`);
      const response = await this.api.get<any>(API_ENDPOINTS.respuestaPorId(id));
      logDetailed(`RESPUESTA POR ID ${id}`, response.data);
      return this.normalizeAnalysisResult(response.data);
    } catch (error) {
      console.error(`[DataAnalysis] Error al obtener respuesta ${id}:`, error);
      console.warn('[DataAnalysis] Usando datos ficticios para respuesta específica');
      this.usesMockData = true;
      
      // Buscar el ID en la historia ficticia o devolver el primer elemento
      const response = MOCK_DATA.analysisHistory.find(r => r.response_id === id) || MOCK_DATA.analysisHistory[0];
      return response;
    }
  }
  
  /**
   * Obtiene la lista de modelos de IA disponibles
   * @returns Lista de modelos y el modelo activo actual
   */
  async obtenerModelos(): Promise<ModelList> {
    try {
      const response = await this.api.get<ModelList>(API_ENDPOINTS.modelos);
      console.log('[DataAnalysis] Modelos obtenidos:', response.data.modelos.length);
      return response.data;
    } catch (error) {
      console.error('[DataAnalysis] Error al obtener modelos:', error);
      console.warn('[DataAnalysis] Usando datos ficticios para modelos');
      this.usesMockData = true;
      return MOCK_DATA.models;
    }
  }
  
  /**
   * Cambia el modelo de IA activo
   * @param nombreModelo Nombre del modelo a activar
   * @returns Información del cambio de modelo
   */
  async cambiarModelo(nombreModelo: string): Promise<{mensaje: string; modelo: string}> {
    try {
      console.log(`[DataAnalysis] Cambiando a modelo: ${nombreModelo}`);
      const response = await this.api.post<{mensaje: string; modelo: string}>(
        API_ENDPOINTS.cambiarModelo(nombreModelo)
      );
      console.log('[DataAnalysis] Modelo cambiado:', response.data.modelo);
      return response.data;
    } catch (error) {
      console.error(`[DataAnalysis] Error al cambiar al modelo ${nombreModelo}:`, error);
      console.warn('[DataAnalysis] Usando simulación para cambio de modelo');
      this.usesMockData = true;
      
      // Simular cambio de modelo
      if (this.usesMockData) {
        // Actualizar el modelo activo en nuestros datos ficticios
        MOCK_DATA.models.modelo_activo = nombreModelo;
        
        // Actualizar estado activo de cada modelo
        MOCK_DATA.models.modelos.forEach(modelo => {
          modelo.activo = modelo.nombre === nombreModelo;
        });
      }
      
      return {
        mensaje: `Modelo cambiado a ${nombreModelo} (simulado)`,
        modelo: nombreModelo
      };
    }
  }

  /**
   * Muestra todas las respuestas en consola para depuración
   */
  async mostrarTodasLasRespuestas(): Promise<void> {
    try {
      console.log('\n======== MOSTRANDO TODAS LAS RESPUESTAS DISPONIBLES ========\n');
      
      // Obtener todas las respuestas (aumentar el límite para obtener más)
      const respuestas = await this.obtenerRespuestas(50);
      
      console.log(`\n======== SE ENCONTRARON ${respuestas.length} RESPUESTAS ========\n`);
      
      // Mostrar cada respuesta de forma detallada
      respuestas.forEach((resp, index) => {
        console.log(`\n============= RESPUESTA #${index + 1} =============`);
        console.log(`ID: ${resp.response_id || 'no disponible'}`);
        console.log(`Fecha: ${resp.timestamp ? new Date(resp.timestamp).toLocaleString() : 'no disponible'}`);
        
        // Mostrar contenido de la respuesta
        if (resp.response) {
          if (typeof resp.response === 'string') {
            console.log(`\nCONTENIDO (primeros 150 caracteres):\n${resp.response.substring(0, 150)}...`);
          } else {
            console.log(`\nCONTENIDO (objeto):\n${JSON.stringify(resp.response, null, 2)}`);
          }
        } else {
          console.log('\nSin contenido');
        }
        
        console.log(`============= FIN RESPUESTA #${index + 1} =============\n`);
      });
      
      console.log('\n======== FIN DEL LISTADO DE RESPUESTAS ========\n');
    } catch (error) {
      console.error('[DataAnalysis] Error mostrando todas las respuestas:', error);
    }
  }

  /**
   * Verifica si el servicio está funcionando con datos simulados
   */
  isUsingMockData(): boolean {
    return this.usesMockData;
  }
}

// Exportar una instancia única del servicio
export const dataAnalysisService = new DataAnalysisService();
export default dataAnalysisService; 