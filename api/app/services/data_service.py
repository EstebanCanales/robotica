from app.database import db
from app.models.sensor_data import SensorReading, BulkSensorReadings
from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId

# Helper para convertir ObjectId a string


def parse_json(data):
    """
    Convierte objetos de MongoDB a un formato serializable a JSON
    """
    if isinstance(data, list):
        return [parse_json(item) for item in data]
    elif isinstance(data, dict):
        return {key: parse_json(value) for key, value in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data


class DataService:
    @staticmethod
    async def save_sensor_reading(reading: SensorReading) -> Dict[str, Any]:
        result = await db.db.sensor_readings.insert_one(reading.model_dump())
        return {"id": str(result.inserted_id), "success": True}

    @staticmethod
    async def save_bulk_readings(data: BulkSensorReadings) -> Dict[str, Any]:
        readings_with_device = []
        for reading in data.readings:
            reading_dict = reading.model_dump()
            reading_dict["device_id"] = data.device_id
            readings_with_device.append(reading_dict)

        result = await db.db.sensor_readings.insert_many(readings_with_device)
        return {"inserted_count": len(result.inserted_ids), "success": True}

    @staticmethod
    async def get_latest_readings(device_id: Optional[str] = None,
                                  sensor_type: Optional[str] = None,
                                  limit: int = 100) -> List[Dict[str, Any]]:
        try:
            query = {}
            if device_id:
                query["device_id"] = device_id
            if sensor_type:
                query["sensor_type"] = sensor_type

            cursor = db.db.sensor_readings.find(
                query).sort("timestamp", -1).limit(limit)
            results = await cursor.to_list(length=limit)

            # Convertir los resultados a un formato JSON serializable
            return parse_json(results)

        except Exception as e:
            print(f"Error in get_latest_readings: {e}")
            return []

    @staticmethod
    async def delete_sensor_readings(device_id: Optional[str] = None,
                                     sensor_type: Optional[str] = None) -> Dict[str, Any]:
        try:
            query = {}
            if device_id:
                query["device_id"] = device_id
            if sensor_type:
                query["sensor_type"] = sensor_type

            result = await db.db.sensor_readings.delete_many(query)
            return {
                "deleted_count": result.deleted_count,
                "success": True
            }
        except Exception as e:
            print(f"Error in delete_sensor_readings: {e}")
            raise e

    @staticmethod
    async def update_sensor_value(reading_id: str, new_value: float) -> Dict[
        str,
        Any
    ]:
        """
        Actualiza el valor de un sensor específico por su ID
        """
        try:
            result = await db.db.sensor_readings.update_one(
                {"_id": ObjectId(reading_id)},
                {"$set": {"value": new_value}}
            )

            if result.matched_count == 0:
                raise ValueError(
                    f"No se encontró lectura con ID: {reading_id}")

            return {
                "success": True,
                "modified_count": result.modified_count,
                "reading_id": reading_id
            }
        except Exception as e:
            print(f"Error updating sensor value: {e}")
            raise e
