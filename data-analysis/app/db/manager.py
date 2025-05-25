"""
Gestor de base de datos SQLite.
"""
import sqlite3
import json
from datetime import datetime
import logging
from typing import Dict, Any, List, Optional
import os

logger = logging.getLogger(__name__)

# Directorio para guardar los datos
DATA_DIR = os.path.join(os.getcwd(), "data")
os.makedirs(DATA_DIR, exist_ok=True)


class DatabaseManager:
    """Clase para gestionar la base de datos SQLite."""
    
    def __init__(self, db_file: str = "sensores.db"):
        """Inicializar el gestor de base de datos SQLite.
        
        Args:
            db_file: Ruta al archivo de la base de datos SQLite
        """
        self.db_file = os.path.join(DATA_DIR, db_file)
        logger.info(f"Base de datos inicializada en: {self.db_file}")
        
    def get_connection(self):
        """Obtener una conexión a la base de datos."""
        return sqlite3.connect(self.db_file)
    
    def setup_database(self):
        """Configurar la base de datos con las tablas necesarias."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Tabla para datos de sensores
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS sensor_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                raw_data TEXT NOT NULL,
                
                presion_hPa REAL,
                temperatura_a REAL,
                
                luz_cruda INTEGER,
                uv_crudo INTEGER,
                lux REAL,
                indice_uv REAL,
                
                co2_ppm REAL,
                temperatura_b REAL,
                humedad_pct REAL,
                
                latitud REAL,
                longitud REAL,
                
                created_at TEXT NOT NULL
            )
            ''')
            
            # Tabla para datos climáticos satelitales
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS clima_satelital (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sensor_data_id INTEGER NOT NULL,
                T2M REAL,
                T2M_MAX REAL,
                T2M_MIN REAL,
                T2M_RANGE REAL,
                PRECTOTCORR REAL,
                RH2M REAL,
                QV2M REAL,
                WS10M REAL,
                WS10M_MAX REAL,
                WS10M_MIN REAL,
                T2MDEW REAL,
                T2MWET REAL,
                TS REAL,
                ALLSKY_SFC_LW_DWN REAL,
                ALLSKY_SFC_SW_DWN REAL,
                CLRSKY_SFC_SW_DWN REAL,
                ALLSKY_KT REAL,
                EVLAND REAL,
                PS REAL,
                FOREIGN KEY (sensor_data_id) REFERENCES sensor_data (id)
            )
            ''')
            
            # Tabla para respuestas de Ollama
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS ollama_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sensor_data_id INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                prompt TEXT NOT NULL,
                response TEXT NOT NULL,
                model_used TEXT NOT NULL,
                FOREIGN KEY (sensor_data_id) REFERENCES sensor_data (id)
            )
            ''')
            
            conn.commit()
            logger.info("Base de datos configurada correctamente")
        except sqlite3.Error as e:
            logger.error(f"Error al configurar la base de datos: {str(e)}")
            raise
        finally:
            conn.close()
    
    def save_sensor_data(self, data: Dict[str, Any]) -> int:
        """Guardar datos de sensores en la base de datos.
        
        Args:
            data: Diccionario con los datos de los sensores
            
        Returns:
            ID del registro insertado
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Extraer valores de los sensores
            timestamp = data.get('timestamp', datetime.now().isoformat())
            
            sensor_bmp390 = data.get('sensor_bmp390', {})
            presion_hPa = sensor_bmp390.get('presion_hPa')
            temperatura_a = sensor_bmp390.get('temperatura_a')
            
            sensor_ltr390 = data.get('sensor_ltr390', {})
            luz_cruda = sensor_ltr390.get('luz_cruda')
            uv_crudo = sensor_ltr390.get('uv_crudo')
            lux = sensor_ltr390.get('lux')
            indice_uv = sensor_ltr390.get('indice_uv')
            
            sensor_scd30 = data.get('sensor_scd30', {})
            co2_ppm = sensor_scd30.get('co2_ppm')
            temperatura_b = sensor_scd30.get('temperatura_b')
            humedad_pct = sensor_scd30.get('humedad_pct')
            
            gps = data.get('gps', {})
            latitud = gps.get('latitud')
            longitud = gps.get('longitud')
            
            created_at = datetime.now().isoformat()
            
            # Insertar en tabla sensor_data
            cursor.execute('''
            INSERT INTO sensor_data (
                timestamp, raw_data, 
                presion_hPa, temperatura_a, 
                luz_cruda, uv_crudo, lux, indice_uv, 
                co2_ppm, temperatura_b, humedad_pct, 
                latitud, longitud, 
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                timestamp, json.dumps(data),
                presion_hPa, temperatura_a,
                luz_cruda, uv_crudo, lux, indice_uv,
                co2_ppm, temperatura_b, humedad_pct,
                latitud, longitud,
                created_at
            ))
            
            sensor_data_id = cursor.lastrowid
            
            # Insertar datos climáticos satelitales
            clima_satelital = data.get('clima_satelital', {})
            if clima_satelital:
                clima_values = [
                    sensor_data_id,
                    clima_satelital.get('T2M'),
                    clima_satelital.get('T2M_MAX'),
                    clima_satelital.get('T2M_MIN'),
                    clima_satelital.get('T2M_RANGE'),
                    clima_satelital.get('PRECTOTCORR'),
                    clima_satelital.get('RH2M'),
                    clima_satelital.get('QV2M'),
                    clima_satelital.get('WS10M'),
                    clima_satelital.get('WS10M_MAX'),
                    clima_satelital.get('WS10M_MIN'),
                    clima_satelital.get('T2MDEW'),
                    clima_satelital.get('T2MWET'),
                    clima_satelital.get('TS'),
                    clima_satelital.get('ALLSKY_SFC_LW_DWN'),
                    clima_satelital.get('ALLSKY_SFC_SW_DWN'),
                    clima_satelital.get('CLRSKY_SFC_SW_DWN'),
                    clima_satelital.get('ALLSKY_KT'),
                    clima_satelital.get('EVLAND'),
                    clima_satelital.get('PS')
                ]
                
                cursor.execute('''
                INSERT INTO clima_satelital (
                    sensor_data_id, T2M, T2M_MAX, T2M_MIN, T2M_RANGE, PRECTOTCORR,
                    RH2M, QV2M, WS10M, WS10M_MAX, WS10M_MIN, T2MDEW, T2MWET,
                    TS, ALLSKY_SFC_LW_DWN, ALLSKY_SFC_SW_DWN, CLRSKY_SFC_SW_DWN,
                    ALLSKY_KT, EVLAND, PS
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', clima_values)
            
            conn.commit()
            logger.info(f"Datos de sensores guardados con ID: {sensor_data_id}")
            return sensor_data_id
        
        except sqlite3.Error as e:
            logger.error(f"Error al guardar datos de sensores: {str(e)}")
            raise
        finally:
            conn.close()
    
    def save_response(self, sensor_data_id: int, prompt: str, response: str, model_used: str) -> int:
        """Guardar respuesta de Ollama en la base de datos.
        
        Args:
            sensor_data_id: ID de los datos de sensores asociados
            prompt: Prompt enviado a Ollama
            response: Respuesta recibida de Ollama
            model_used: Modelo de IA utilizado
            
        Returns:
            ID del registro insertado
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            timestamp = datetime.now().isoformat()
            
            cursor.execute('''
            INSERT INTO ollama_responses (
                sensor_data_id, timestamp, prompt, response, model_used
            ) VALUES (?, ?, ?, ?, ?)
            ''', (sensor_data_id, timestamp, prompt, response, model_used))
            
            response_id = cursor.lastrowid
            conn.commit()
            logger.info(f"Respuesta de Ollama guardada con ID: {response_id}")
            return response_id
        
        except sqlite3.Error as e:
            logger.error(f"Error al guardar respuesta de Ollama: {str(e)}")
            raise
        finally:
            conn.close()
    
    def get_all_responses(self) -> List[Dict[str, Any]]:
        """Obtener todas las respuestas de Ollama.
        
        Returns:
            Lista de respuestas
        """
        try:
            conn = self.get_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
            SELECT id, timestamp, prompt, response, model_used
            FROM ollama_responses
            ORDER BY timestamp DESC
            ''')
            
            rows = cursor.fetchall()
            responses = [dict(row) for row in rows]
            return responses
        
        except sqlite3.Error as e:
            logger.error(f"Error al obtener respuestas: {str(e)}")
            raise
        finally:
            conn.close()
    
    def get_response_by_id(self, response_id: int) -> Optional[Dict[str, Any]]:
        """Obtener una respuesta específica por su ID.
        
        Args:
            response_id: ID de la respuesta
            
        Returns:
            Diccionario con la respuesta o None si no se encuentra
        """
        try:
            conn = self.get_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
            SELECT id, timestamp, prompt, response, model_used
            FROM ollama_responses
            WHERE id = ?
            ''', (response_id,))
            
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
        
        except sqlite3.Error as e:
            logger.error(f"Error al obtener respuesta por ID: {str(e)}")
            raise
        finally:
            conn.close() 