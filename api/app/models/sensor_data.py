from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


class SensorReading(BaseModel):
    sensor_id: str
    sensor_type: str
    timestamp: datetime = Field(default_factory=datetime.now)
    value: float
    unit: str
    metadata: Optional[Dict[str, Any]] = None


class BulkSensorReadings(BaseModel):
    device_id: str
    readings: List[SensorReading]
    device_metadata: Optional[Dict[str, Any]] = None


class SensorUpdate(BaseModel):
    value: float
