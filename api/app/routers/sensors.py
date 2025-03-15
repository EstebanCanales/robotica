from typing import List, Dict, Any, Optional
from app.services.data_service import DataService
from fastapi import APIRouter, HTTPException, Depends
from app.models.sensor_data import SensorReading, BulkSensorReadings, SensorUpdate

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.post("/reading", status_code=201)
async def add_sensor_reading(reading: SensorReading):
    """Add a single sensor reading"""
    result = await DataService.save_sensor_reading(reading)
    return result


@router.post("/readings/bulk", status_code=201)
async def add_bulk_readings(data: BulkSensorReadings):
    """Add multiple sensor readings in a single request"""
    result = await DataService.save_bulk_readings(data)
    return result


@router.get("/readings")
async def get_readings(device_id: Optional[str] = None,
                       sensor_type: Optional[str] = None,
                       limit: int = 100):
    """Get sensor readings with optional filtering"""
    readings = await DataService.get_latest_readings(
        device_id,
        sensor_type,
        limit
    )
    return readings


@router.post("/test-endpoint", status_code=200)
async def test_endpoint(data: dict):
    from datetime import datetime

    # Añade un timestamp para confirmar que se procesó
    response = {
        "received_data": data,
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }

    return response


@router.put("/reading/{reading_id}")
async def update_sensor_reading(reading_id: str, update_data: SensorUpdate):
    """
    Actualiza el valor de una lectura de sensor específica
    """
    try:
        result = await DataService.update_sensor_reading(reading_id, update_data.value)
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=404,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la lectura del sensor: {str(e)}"
        )


@router.delete("/readings")
async def delete_readings(device_id: Optional[str] = None,
                          sensor_type: Optional[str] = None):
    """
    Elimina lecturas de sensores con filtros opcionales.
    Si no se proporcionan filtros, se eliminarán todas las lecturas.
    """
    try:
        result = await DataService.delete_sensor_readings(
            device_id,
            sensor_type
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar las lecturas de sensores: {str(e)}"
        )
