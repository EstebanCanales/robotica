from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class SensorData(BaseModel):
    """Modelo de datos de sensores."""
    gps: Dict[str, Any]
    sensor_bmp390: Dict[str, Any]
    sensor_ltr390: Dict[str, Any]
    clima_satelital: Dict[str, Any]

class AnalysisResponse(BaseModel):
    """Modelo de respuesta de análisis."""
    message: str
    data_id: int
    response_id: int
    response: str

class ModelInfo(BaseModel):
    """Información de un modelo de IA."""
    nombre: str
    activo: bool = False
    detalles: Dict[str, Any] = Field(default_factory=dict)

class ModelList(BaseModel):
    """Lista de modelos de IA disponibles."""
    modelos: List[ModelInfo] = Field(default_factory=list)
    modelo_activo: str 