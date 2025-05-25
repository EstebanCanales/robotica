"""
Utilidades para obtener datos de sensores.
"""
import os
import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# URL de la API de sensores (se puede configurar mediante variable de entorno)
SENSOR_API_URL = os.getenv("SENSOR_API_URL", "http://0.0.0.0:8080/datos")

def get_sensor_data() -> Dict[str, Any]:
    """
    Obtener datos de los sensores desde la API.
    
    Returns:
        Diccionario con los datos de los sensores
    
    Raises:
        Exception: Si ocurre un error al obtener los datos
    """
    try:
        logger.info(f"Obteniendo datos de sensores desde: {SENSOR_API_URL}")
        response = requests.get(SENSOR_API_URL, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        logger.info(f"Datos obtenidos correctamente: {len(str(data))} bytes")
        return data
    except requests.RequestException as e:
        logger.error(f"Error al obtener datos de sensores: {str(e)}")
        raise Exception(f"Error al obtener datos de sensores: {str(e)}")
    except Exception as e:
        logger.error(f"Error inesperado al obtener datos: {str(e)}")
        raise 