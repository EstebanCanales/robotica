// Configuración de URLs para la API
export const DEV_API_BASE_URL = 'http://localhost:8000'; // URL para desarrollo local
export const PROD_API_BASE_URL = 'http://192.168.1.123:8000'; // URL para acceder desde dispositivos en la misma red

// Determina si estamos en modo desarrollo
const isDev = process.env.NODE_ENV === 'development';

// URL base para la API basada en el entorno
export const API_BASE_URL = isDev ? DEV_API_BASE_URL : PROD_API_BASE_URL;

// Endpoints específicos
export const API_ENDPOINTS = {
  // Información general
  root: '/',
  
  // Datos de sensores
  sensorData: '/sensor-data',
  
  // Análisis
  procesarDatos: '/procesar-datos',
  respuestas: '/respuestas',
  respuestaPorId: (id: number) => `/respuestas/${id}`,
  
  // Modelos
  modelos: '/modelos',
  cambiarModelo: (modelo: string) => `/cambiar-modelo/${modelo}`,
}; 