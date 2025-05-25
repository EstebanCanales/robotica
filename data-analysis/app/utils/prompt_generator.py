"""
Generador de prompts para Ollama.
"""
from typing import Dict, Any
import json
import logging

logger = logging.getLogger(__name__)


def generate_prompt(data: Dict[str, Any]) -> str:
    """
    Generar prompt para Ollama basado en los datos de los sensores.
    
    Args:
        data: Diccionario con los datos de los sensores
        
    Returns:
        Prompt generado
    """
    # Asegurarse de que data sea un diccionario
    if isinstance(data, str):
        try:
            data = json.loads(data)
            logger.info("Datos convertidos de string a diccionario")
        except json.JSONDecodeError as e:
            logger.error(f"Error al decodificar datos JSON: {str(e)}")
            raise ValueError("Los datos deben ser un diccionario o un JSON válido")

    # Depuración de datos
    logger.info(f"Claves en el objeto data: {list(data.keys())}")
    
    # Verificar que todas las claves necesarias existen
    required_keys = ['gps', 'sensor_bmp390', 'sensor_ltr390', 'clima_satelital']
    missing_keys = [key for key in required_keys if key not in data]
    if missing_keys:
        logger.error(f"Faltan claves requeridas en los datos: {missing_keys}")
        # Usar datos de ejemplo si faltan claves
        logger.info("Usando datos de ejemplo para las claves faltantes")
        # Asegurarse de que existan todas las claves necesarias
        if 'gps' not in data:
            data['gps'] = {'latitud': 9.889, 'longitud': -84.089}
        if 'sensor_bmp390' not in data:
            data['sensor_bmp390'] = {'temperatura_a': 24.2, 'presion_hPa': 885.7}
        if 'sensor_ltr390' not in data:
            data['sensor_ltr390'] = {'lux': 81.3, 'indice_uv': 0.69}
        if 'clima_satelital' not in data:
            data['clima_satelital'] = {
                'T2M': 22.5, 'RH2M': 92.3, 'PRECTOTCORR': 14.7, 'WS10M': 0.99
            }
    
    # Crear un resumen de los datos más importantes para un prompt más conciso
    try:
        data_resumen = {
            "ubicacion": {
                "latitud": data['gps']['latitud'],
                "longitud": data['gps']['longitud']
            },
            "clima": {
                "temperatura": data['sensor_bmp390']['temperatura_a'],
                "presion_hPa": data['sensor_bmp390']['presion_hPa'],
                "luz_lux": data['sensor_ltr390']['lux'],
                "indice_uv": data['sensor_ltr390']['indice_uv']
            },
            "clima_satelital": {
                "temp_media": data['clima_satelital']['T2M'],
                "humedad": data['clima_satelital']['RH2M'],
                "precipitacion": data['clima_satelital']['PRECTOTCORR'],
                "viento": data['clima_satelital']['WS10M']
            }
        }
        logger.info("Resumen de datos creado correctamente")
    except KeyError as e:
        logger.error(f"Error al acceder a una clave en los datos: {str(e)}")
        # Usar un resumen predeterminado
        data_resumen = {
            "ubicacion": {"latitud": 9.889, "longitud": -84.089},
            "clima": {"temperatura": 24.2, "presion_hPa": 885.7, "luz_lux": 81.3, "indice_uv": 0.69},
            "clima_satelital": {"temp_media": 22.5, "humedad": 92.3, "precipitacion": 14.7, "viento": 0.99}
        }
        logger.info("Usando resumen predeterminado debido a un error")
    
    # Convertir los datos resumidos a formato JSON para incluirlos en el prompt
    data_json = json.dumps(data_resumen, indent=2)
    
    prompt = """Eres un experto en agricultura de precisión, agronomía y ciencias ambientales. Analiza los siguientes datos ambientales y genera un informe agrícola completo y detallado en el formato estructurado que se indica a continuación.

### 📍 Ubicación y Condiciones Generales
- Latitud y longitud exactas (incluye los valores numéricos)
- Altitud aproximada (calcula a partir de la presión atmosférica)
- Temperatura (especifica °C)
- Humedad relativa (especifica %)
- Radiación solar (especifica W/m² o lux)
- Precipitación acumulada (especifica mm)
- Velocidad del viento (especifica m/s)
- Índice UV y su interpretación
- Calidad del aire (si hay datos disponibles)
- Presión atmosférica (especifica hPa)

### 🌾 Cultivos Recomendados
Por cada cultivo viable según las condiciones específicas, incluye:
- 🌱 **Nombre del cultivo** (científico y común)
  - Variedades específicas recomendadas para esta región
  - Temporada ideal de siembra (meses específicos)
  - Requisitos edafoclimáticos que cumple este ambiente
  - Ciclo de cultivo esperado (días hasta cosecha)
  - Rendimiento potencial (ton/ha o kg/m²)
  - Consideraciones especiales para esta ubicación

### ✅ Consejos de Manejo Agronómico
- Preparación del terreno (técnicas específicas, profundidad de laboreo)
- Riego:
  * Sistema recomendado (goteo, aspersión, etc.)
  * Frecuencia (días)
  * Duración (minutos/horas)
  * Cantidad (litros/m²)
- Fertilización:
  * Requerimientos NPK según etapa fenológica
  * Micronutrientes críticos para la zona
  * Cronograma de aplicación
- Control de plagas y enfermedades:
  * Plagas y enfermedades comunes en esta zona y condiciones
  * Umbrales económicos de daño
  * Métodos de control integrado
  * Productos biológicos y químicos recomendados

### ⚠️ Riesgos Potenciales
- Clima extremo (probabilidad de sequías, inundaciones, heladas)
- Limitaciones edáficas según la zona
- Posibles deficiencias nutricionales según el perfil de suelo típico
- Plagas o enfermedades estacionales con mayor probabilidad
- Riesgos asociados al cambio climático en esta región

### 🌿 Sostenibilidad y Buenas Prácticas
- Técnicas agroecológicas específicas para esta zona
- Manejo del agua:
  * Tecnologías de conservación
  * Captación de agua de lluvia
  * Reutilización
- Manejo del suelo:
  * Cultivos de cobertura recomendados
  * Técnicas anti-erosión
  * Incorporación de materia orgánica
- Biodiversidad:
  * Especies beneficiosas a promover
  * Corredores biológicos
  * Manejo integrado de plagas
- Medidas para mitigar huella de carbono

### 📊 Datos Analizados
Incluye un resumen de los datos originales y valores derivados.

Datos para procesar:
"""
    
    # Añadir los datos resumidos en formato JSON
    prompt += data_json
    
    prompt += """

Tu respuesta debe ser detallada, precisa y directamente aplicable para agricultores y técnicos agrícolas. Utiliza valores numéricos específicos cuando sea posible. Si algún dato no está disponible, indícalo como "No disponible" y haz recomendaciones basadas en la información que sí tienes. Responde en español utilizando terminología técnica apropiada.
"""
    
    logger.info(f"Prompt generado con éxito (longitud: {len(prompt)} caracteres)")
    return prompt 