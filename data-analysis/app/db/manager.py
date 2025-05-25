"""
Gestor de base de datos SQLite.
"""
import os
import json
import sqlite3
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class DBManager:
    """Gestor de base de datos SQLite."""
    
    def __init__(self, db_path: str = None):
        """
        Inicializar el gestor de base de datos.
        
        Args:
            db_path: Ruta del archivo de base de datos
        """
        self.db_path = db_path or os.path.join(os.getenv("DATA_DIR", "data"), "sensores.db")
        
        # Asegurar que el directorio existe
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        # Inicializar la conexión con check_same_thread=False para permitir su uso en diferentes threads
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        
        # Configurar la base de datos
        logger.info(f"Base de datos inicializada en: {self.db_path}")
        self.setup_database()
    
    def close(self):
        """Cerrar la conexión a la base de datos."""
        if hasattr(self, 'conn'):
            self.conn.close()
            logger.info("Conexión a la base de datos cerrada")
    
    def setup_database(self):
        """Configurar la base de datos."""
        try:
            # Asegurarse de que existe la carpeta de datos
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            cursor = self.conn.cursor()
            
            # Crear tablas si no existen
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sensor_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    data TEXT NOT NULL
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS analysis_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_id INTEGER NOT NULL,
                    result TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (data_id) REFERENCES sensor_data (id)
                )
            ''')
            
            self.conn.commit()
            logger.info("Base de datos configurada correctamente")
        except Exception as e:
            logger.error(f"Error al configurar la base de datos: {str(e)}")
            raise Exception(f"Error al configurar la base de datos: {str(e)}")
    
    def save_sensor_data(self, data):
        """
        Guardar datos de sensores en la base de datos.
        
        Args:
            data: Datos de sensores en formato JSON
            
        Returns:
            ID del registro insertado
        """
        try:
            # Depuración
            logger.info(f"Tipo de datos a guardar: {type(data)}")
            
            # Asegurar que data sea un string para guardar en la BD
            if not isinstance(data, str):
                logger.info("Convirtiendo datos a JSON string")
                data = json.dumps(data)
                
            cursor = self.conn.cursor()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            cursor.execute(
                "INSERT INTO sensor_data (timestamp, data) VALUES (?, ?)",
                (timestamp, data)
            )
            
            self.conn.commit()
            new_id = cursor.lastrowid
            logger.info(f"Datos guardados en la base de datos con ID: {new_id}")
            return new_id
        except Exception as e:
            logger.error(f"Error al guardar datos en la base de datos: {str(e)}")
            raise Exception(f"Error al guardar datos en la base de datos: {str(e)}")
    
    def save_analysis_result(self, data_id: int, result: str) -> int:
        """
        Guardar resultado del análisis en la base de datos.
        
        Args:
            data_id: ID de los datos analizados
            result: Resultado del análisis
            
        Returns:
            ID del registro insertado
        """
        try:
            cursor = self.conn.cursor()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            cursor.execute(
                "INSERT INTO analysis_results (data_id, result, timestamp) VALUES (?, ?, ?)",
                (data_id, result, timestamp)
            )
            
            self.conn.commit()
            new_id = cursor.lastrowid
            logger.info(f"Resultado guardado en la base de datos con ID: {new_id}")
            return new_id
        except Exception as e:
            logger.error(f"Error al guardar resultado en la base de datos: {str(e)}")
            raise Exception(f"Error al guardar resultado en la base de datos: {str(e)}")
    
    def get_analysis_results(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Obtener resultados de análisis almacenados en la base de datos.
        
        Args:
            limit: Número máximo de resultados a obtener
            
        Returns:
            Lista de resultados
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT ar.id, ar.data_id, ar.result, ar.timestamp, sd.data 
                FROM analysis_results ar
                JOIN sensor_data sd ON ar.data_id = sd.id
                ORDER BY ar.id DESC LIMIT ?
            """, (limit,))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    "id": row[0],
                    "data_id": row[1],
                    "result": row[2],
                    "timestamp": row[3],
                    "data": json.loads(row[4]) if row[4] else None
                })
                
            logger.info(f"Obtenidos {len(results)} resultados de análisis")
            return results
        except Exception as e:
            logger.error(f"Error al obtener resultados de análisis: {str(e)}")
            raise Exception(f"Error al obtener resultados de análisis: {str(e)}")
    
    def get_analysis_result(self, result_id: int) -> Optional[Dict[str, Any]]:
        """
        Obtener un resultado de análisis específico.
        
        Args:
            result_id: ID del resultado a obtener
            
        Returns:
            Resultado de análisis o None si no existe
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT ar.id, ar.data_id, ar.result, ar.timestamp, sd.data 
                FROM analysis_results ar
                JOIN sensor_data sd ON ar.data_id = sd.id
                WHERE ar.id = ?
            """, (result_id,))
            
            row = cursor.fetchone()
            if row:
                result = {
                    "id": row[0],
                    "data_id": row[1],
                    "result": row[2],
                    "timestamp": row[3],
                    "data": json.loads(row[4]) if row[4] else None
                }
                logger.info(f"Obtenido resultado de análisis con ID: {result_id}")
                return result
            else:
                logger.warning(f"No se encontró resultado de análisis con ID: {result_id}")
                return None
        except Exception as e:
            logger.error(f"Error al obtener resultado de análisis: {str(e)}")
            raise Exception(f"Error al obtener resultado de análisis: {str(e)}") 