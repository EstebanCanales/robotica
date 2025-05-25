"""
Esquemas de datos para la API.
"""
from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class SensorDataResponse(BaseModel):
    """Modelo para la respuesta de datos de sensores."""
    id: int
    timestamp: str
    raw_data: Dict[str, Any]


class ResponseModel(BaseModel):
    """Modelo para las respuestas de análisis."""
    id: int
    timestamp: str
    prompt: str
    response: str


class ProcessedDataResponse(BaseModel):
    """Modelo para la respuesta de datos procesados."""
    message: str
    data_id: int
    response_id: int
    response: str 