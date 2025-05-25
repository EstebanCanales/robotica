"""
Rutas de la API para la aplicación.
"""
import os
import logging
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
import json

from app.models.schemas import SensorData, AnalysisResponse, ModelInfo, ModelList
from app.db.manager import DBManager
from app.ai.ollama_client import OllamaClient
from app.utils.prompt_generator import generate_prompt
from app.utils.data_fetcher import get_sensor_data

logger = logging.getLogger(__name__)

router = APIRouter()

# Configuración
db_manager = DBManager()
ollama_client = OllamaClient()
SENSOR_API_URL = os.getenv("SENSOR_API_URL", "http://0.0.0.0:8080/datos")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

def get_db():
    """Obtener instancia de la base de datos."""
    return DBManager()

def get_ollama_client():
    """Obtener instancia del cliente de Ollama."""
    return OllamaClient()

@router.get("/", summary="Información de la API")
async def root():
    """Endpoint raíz que muestra información básica sobre la API"""
    return {"message": "API de Análisis de Datos de Sensores"}

@router.get("/procesar-datos", response_model=AnalysisResponse, summary="Procesar datos de sensores")
async def procesar_datos(
    db: DBManager = Depends(get_db),
    ollama_client: OllamaClient = Depends(get_ollama_client)
):
    """
    Endpoint para procesar datos de sensores, guardarlos en la base de datos
    y generar una respuesta con un modelo de IA.
    
    Returns:
        Resultado del análisis
    """
    try:
        # Obtener datos de los sensores
        logger.info("1. Obteniendo datos de sensores...")
        data = get_sensor_data()
        
        # Depuración: verificar el tipo de dato
        logger.info(f"2. Tipo de datos recibidos: {type(data)}")
        if isinstance(data, str):
            logger.info("Datos recibidos como string, intentando convertir a JSON")
            try:
                data = json.loads(data)
                logger.info("Conversión a JSON exitosa")
            except json.JSONDecodeError as e:
                logger.error(f"Error al decodificar JSON: {str(e)}")
                raise Exception(f"Error al decodificar JSON: {str(e)}")
        
        # Guardar datos en la base de datos
        logger.info("3. Guardando datos en la base de datos...")
        data_str = json.dumps(data) if not isinstance(data, str) else data
        data_id = db.save_sensor_data(data_str)
        logger.info(f"4. Datos guardados con ID: {data_id}")
        
        # Generar prompt para Ollama
        logger.info("5. Generando prompt...")
        try:
            prompt = generate_prompt(data)
            logger.info("6. Prompt generado correctamente")
        except Exception as e:
            logger.error(f"Error al generar prompt: {str(e)}")
            raise Exception(f"Error al generar prompt: {str(e)}")
        
        # Obtener respuesta de Ollama
        logger.info("7. Obteniendo respuesta de Ollama...")
        try:
            response = ollama_client.get_response(prompt)
            logger.info("8. Respuesta obtenida correctamente")
        except Exception as e:
            logger.error(f"Error al obtener respuesta de Ollama: {str(e)}")
            raise Exception(f"Error al obtener respuesta de Ollama: {str(e)}")
        
        # Guardar respuesta en la base de datos
        logger.info("9. Guardando respuesta en la base de datos...")
        response_id = db.save_analysis_result(data_id, response)
        logger.info(f"10. Respuesta guardada con ID: {response_id}")
        
        return AnalysisResponse(
            message="Datos procesados correctamente",
            data_id=data_id,
            response_id=response_id,
            response=response
        )
    except Exception as e:
        logger.error(f"Error al procesar datos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar datos: {str(e)}"
        )

@router.get("/respuestas", response_model=List[Dict[str, Any]], summary="Obtener todas las respuestas")
async def obtener_respuestas(
    limit: int = 10,
    db: DBManager = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Obtener respuestas de análisis.
    
    Args:
        limit: Número máximo de respuestas a obtener
        
    Returns:
        Lista de respuestas
    """
    try:
        return db.get_analysis_results(limit)
    except Exception as e:
        logger.error(f"Error al obtener respuestas: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener respuestas: {str(e)}"
        )

@router.get("/respuestas/{response_id}", response_model=Dict[str, Any], summary="Obtener respuesta por ID")
async def obtener_respuesta(
    response_id: int,
    db: DBManager = Depends(get_db)
) -> Dict[str, Any]:
    """
    Obtener una respuesta de análisis por ID.
    
    Args:
        response_id: ID de la respuesta a obtener
        
    Returns:
        Respuesta de análisis
    """
    try:
        response = db.get_analysis_result(response_id)
        if not response:
            raise HTTPException(
                status_code=404, 
                detail=f"Respuesta con ID {response_id} no encontrada"
            )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener respuesta: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener respuesta: {str(e)}"
        )

@router.get("/modelos", response_model=ModelList)
async def listar_modelos(
    ollama_client: OllamaClient = Depends(get_ollama_client)
) -> ModelList:
    """
    Listar los modelos disponibles en Ollama.
    
    Returns:
        Lista de modelos disponibles
    """
    try:
        models_list = ollama_client.get_models()
        logger.info(f"Modelos obtenidos: {models_list}")
        
        models = []
        for model_name in models_list:
            model_info = ModelInfo(
                nombre=model_name,
                activo=(model_name == ollama_client.model),
                detalles={}
            )
            models.append(model_info)
        
        return ModelList(modelos=models, modelo_activo=ollama_client.model)
    except Exception as e:
        logger.error(f"Error al obtener los modelos: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener los modelos: {str(e)}"
        )

@router.post("/cambiar-modelo/{nombre_modelo}")
async def cambiar_modelo(
    nombre_modelo: str,
    descargar: bool = Query(False, description="Descargar el modelo si no está disponible"),
    ollama_client: OllamaClient = Depends(get_ollama_client)
) -> Dict[str, Any]:
    """
    Cambiar el modelo activo de Ollama.
    
    Args:
        nombre_modelo: Nombre del modelo a activar
        descargar: Si debe descargar el modelo en caso de que no esté disponible
        
    Returns:
        Información del modelo activado
    """
    try:
        # Comprobar si el modelo existe
        models_list = ollama_client.get_models()
        model_exists = nombre_modelo in models_list
        
        if not model_exists and descargar:
            # Descargar manualmente no es posible desde aquí
            raise HTTPException(
                status_code=404, 
                detail=f"El modelo {nombre_modelo} no está disponible y no se puede descargar automáticamente."
            )
        elif not model_exists:
            raise HTTPException(
                status_code=404, 
                detail=f"El modelo {nombre_modelo} no está disponible. Descárgalo manualmente con 'ollama pull {nombre_modelo}'"
            )
        
        # Cambiar el modelo activo
        ollama_client.model = nombre_modelo
        logger.info(f"Modelo cambiado a {nombre_modelo}")
        
        return {
            "mensaje": f"Modelo cambiado correctamente a {nombre_modelo}",
            "modelo": nombre_modelo
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al cambiar el modelo: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al cambiar el modelo: {str(e)}"
        )

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