import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/Api';

// Tipos de datos basados en las estructuras del servidor
export interface SensorData {
  id: number;
  timestamp: string;
  record_id: number;
  // Estos campos pueden variar según los sensores específicos
  temperatura?: number;
  humedad?: number;
  presion?: number;
  luz?: number;
  [key: string]: any; // Para cualquier otro sensor que pueda existir
}

export interface SensorDataResponse {
  message: string;
  count: number;
  data: SensorData[];
}

export interface AnalysisResponse {
  message: string;
  data_id: number;
  response_id: number;
  response: string;
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

// Configuración de timeout para las peticiones (60 segundos)
const AXIOS_TIMEOUT = 60000;

// Clase principal del servicio API
class ApiService {
  // Cliente Axios
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    // Crear instancia de Axios con configuración predeterminada
    this.axiosInstance = axios.create({
      baseURL,
      timeout: AXIOS_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Agregar interceptores para logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`Realizando petición a: ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('Error en la petición:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`Respuesta recibida de ${response.config.url}, status: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.code === 'ECONNABORTED') {
          console.error(`Timeout después de ${AXIOS_TIMEOUT/1000} segundos:`, error.config.url);
        } else if (error.response) {
          console.error('Error en respuesta:', error.response.data);
        } else {
          console.error('Error en la petición API:', error);
        }
        return Promise.reject(error);
      }
    );

    console.log('API Service inicializado con URL:', baseURL);
  }

  // Método genérico para hacer peticiones
  private async callApi<T>(
    endpoint: string, 
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await this.axiosInstance({
        url: endpoint,
        ...options
      });
      return response.data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.detail || `Error: ${error.response.status}`);
        } else if (error.code === 'ECONNABORTED') {
          throw new Error(`La petición a ${endpoint} excedió el tiempo límite de espera de ${AXIOS_TIMEOUT/1000} segundos.`);
        }
      }
      throw error;
    }
  }

  // Obtener datos de sensores
  async getSensorData(limit: number = 5): Promise<SensorDataResponse> {
    const endpoint = `${API_ENDPOINTS.sensorData}?limit=${limit}`;
    console.log('Obteniendo datos de sensores, limit:', limit);
    try {
      const response = await this.callApi<SensorDataResponse>(endpoint);
      console.log('Datos de sensores recibidos:', response.count || 0, 'registros');
      return response;
    } catch (error) {
      console.error('Error obteniendo datos de sensores:', error);
      throw error;
    }
  }

  // Procesar datos y obtener análisis
  async procesarDatos(): Promise<AnalysisResponse> {
    console.log('Procesando datos para análisis (puede tomar hasta 60 segundos)');
    try {
      const response = await this.callApi<AnalysisResponse>(API_ENDPOINTS.procesarDatos);
      console.log('Análisis completado, ID:', response.response_id);
      return response;
    } catch (error) {
      console.error('Error procesando datos:', error);
      throw error;
    }
  }

  // Obtener listado de respuestas de análisis
  async getRespuestas(limit: number = 10): Promise<any[]> {
    const endpoint = `${API_ENDPOINTS.respuestas}?limit=${limit}`;
    console.log('Obteniendo respuestas de análisis, limit:', limit);
    try {
      const response = await this.callApi<any[]>(endpoint);
      console.log('Respuestas recibidas:', response.length || 0, 'registros');
      return response;
    } catch (error) {
      console.error('Error obteniendo respuestas:', error);
      throw error;
    }
  }

  // Obtener una respuesta específica por ID
  async getRespuestaPorId(id: number): Promise<any> {
    console.log('Obteniendo respuesta por ID:', id);
    return this.callApi<any>(API_ENDPOINTS.respuestaPorId(id));
  }

  // Obtener lista de modelos disponibles
  async getModelos(): Promise<ModelList> {
    console.log('Obteniendo modelos disponibles');
    return this.callApi<ModelList>(API_ENDPOINTS.modelos);
  }

  // Cambiar el modelo activo
  async cambiarModelo(nombreModelo: string, descargar: boolean = false): Promise<{ mensaje: string; modelo: string }> {
    const endpoint = `${API_ENDPOINTS.cambiarModelo(nombreModelo)}`;
    console.log('Cambiando a modelo:', nombreModelo);
    return this.callApi<{ mensaje: string; modelo: string }>(endpoint, { 
      method: 'POST',
      params: { descargar }
    });
  }
}

// Exportar una instancia única del servicio
export const apiService = new ApiService();

export default apiService; 