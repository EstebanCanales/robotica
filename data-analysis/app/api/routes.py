"""
Rutas de la API para la aplicación.
"""
import os
import logging
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from app.db.manager import DatabaseManager
from app.ai.ollama_client import OllamaClient
from app.utils.prompt_generator import generate_prompt
from app.models.schema import ResponseModel, ProcessedDataResponse
import requests

logger = logging.getLogger(__name__)

router = APIRouter()

# Configuración
db_manager = DatabaseManager()
ollama_client = OllamaClient()
SENSOR_API_URL = os.getenv("SENSOR_API_URL", "http://0.0.0.0:8080/datos")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")


@router.get("/", summary="Información de la API")
async def root():
    """Endpoint raíz que muestra información básica sobre la API"""
    return {"message": "API de Análisis de Datos de Sensores"}


@router.get("/procesar-datos", response_model=ProcessedDataResponse, summary="Procesar datos de sensores")
async def procesar_datos(model: str = None):
    """
    Endpoint para procesar datos de sensores, guardarlos en la base de datos
    y generar una respuesta con un modelo de IA.
    
    Args:
        model: Modelo de IA a utilizar (opcional)
    """
    try:
        # 1. Obtener datos de la URL
        logger.info(f"Obteniendo datos de sensores desde: {SENSOR_API_URL}")
        data = fetch_sensor_data()
        
        # 2. Guardar datos en la base de datos
        logger.info("Guardando datos en la base de datos...")
        data_id = db_manager.save_sensor_data(data)
        
        # 3. Generar prompt para el modelo
        logger.info("Generando prompt para el modelo de IA...")
        prompt = generate_prompt(data)
        
        # 4. Usar el modelo especificado o el predeterminado
        model_to_use = model or DEFAULT_MODEL
        
        # 5. Obtener respuesta del modelo
        logger.info(f"Obteniendo respuesta del modelo {model_to_use}...")
        response = ollama_client.get_response(prompt, model_to_use)
        
        # 6. Guardar respuesta en la base de datos
        logger.info("Guardando respuesta en la base de datos...")
        response_id = db_manager.save_response(data_id, prompt, response, model_to_use)
        
        return {
            "message": "Datos procesados correctamente",
            "data_id": data_id,
            "response_id": response_id,
            "response": response
        }
    
    except Exception as e:
        logger.error(f"Error al procesar datos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al procesar datos: {str(e)}")


@router.get("/respuestas", response_model=List[ResponseModel], summary="Obtener todas las respuestas")
async def obtener_respuestas():
    """Endpoint para obtener todas las respuestas generadas"""
    try:
        responses = db_manager.get_all_responses()
        return responses
    except Exception as e:
        logger.error(f"Error al obtener respuestas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener respuestas: {str(e)}")


@router.get("/respuestas/{response_id}", response_model=ResponseModel, summary="Obtener respuesta por ID")
async def obtener_respuesta(response_id: int):
    """
    Endpoint para obtener una respuesta específica por su ID
    
    Args:
        response_id: ID de la respuesta a buscar
    """
    try:
        response = db_manager.get_response_by_id(response_id)
        if not response:
            raise HTTPException(status_code=404, detail=f"Respuesta con ID {response_id} no encontrada")
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener respuesta: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener respuesta: {str(e)}")


@router.get("/modelos", summary="Obtener modelos disponibles")
async def obtener_modelos():
    """Endpoint para obtener los modelos disponibles en Ollama"""
    try:
        models = ollama_client.get_models()
        return models
    except Exception as e:
        logger.error(f"Error al obtener modelos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener modelos: {str(e)}")


@router.post("/modelos/{model_name}/pull", summary="Descargar un modelo")
async def descargar_modelo(model_name: str):
    """
    Endpoint para descargar un modelo en Ollama
    
    Args:
        model_name: Nombre del modelo a descargar
    """
    try:
        result = ollama_client.pull_model(model_name)
        if result:
            return {"message": f"Modelo {model_name} descargado correctamente"}
        else:
            raise HTTPException(status_code=500, detail=f"Error al descargar modelo {model_name}")
    except Exception as e:
        logger.error(f"Error al descargar modelo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al descargar modelo: {str(e)}")


def fetch_sensor_data() -> Dict[str, Any]:
    """
    Obtener datos de sensores desde la URL especificada
    
    Returns:
        Diccionario con los datos de los sensores
    """
    try:
        response = requests.get(SENSOR_API_URL, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Error al obtener datos de sensores: {str(e)}")
        raise Exception(f"Error al obtener datos de sensores: {str(e)}") 