"""
Generador de prompts para Ollama.
"""
from typing import Dict, Any
import json


def generate_prompt(data: Dict[str, Any]) -> str:
    """
    Generar prompt para Ollama basado en los datos de los sensores.
    
    Args:
        data: Diccionario con los datos de los sensores
        
    Returns:
        Prompt generado
    """
    # Crear un resumen de los datos más importantes para un prompt más conciso
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
    
    # Convertir los datos resumidos a formato JSON para incluirlos en el prompt
    data_json = json.dumps(data_resumen, indent=2)
    
    prompt = """Eres un experto en agricultura de precisión. Analiza estos datos ambientales y genera un informe agrícola en este formato:

### 📍 Ubicación y Condiciones Generales
- Latitud y longitud
- Altitud aproximada (de la presión atmosférica)
- Temperatura, humedad, radiación, precipitación y viento

### 🌾 Cultivos Recomendados
Por cada cultivo viable, incluye:
- 🌱 **Nombre del cultivo**
  - Temporada ideal de siembra
  - Requisitos que cumple
  - Consideraciones especiales

### ✅ Consejos de Manejo Agronómico
- Preparación del terreno
- Riego (frecuencia y tipo)
- Fertilización
- Control de plagas

### ⚠️ Riesgos Potenciales
- Clima extremo
- Limitaciones
- Posibles plagas o enfermedades

### 🌿 Sostenibilidad y Buenas Prácticas
- Técnicas sugeridas
- Uso eficiente del agua
- Medidas para mitigar impacto

### 📊 Datos Recibidos
Incluye un resumen de los datos originales.

Datos para procesar:
"""
    
    # Añadir los datos resumidos en formato JSON
    prompt += data_json
    
    prompt += """

Sé conciso y directo. Si algún dato no está disponible, indícalo como "No disponible". Responde en español.
"""
    
    return prompt 