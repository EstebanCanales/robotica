"""
Cliente para interactuar con Ollama.
"""
import os
import time
import json
import logging
import requests
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class OllamaClientSingleton:
    """Implementación Singleton del cliente de Ollama para mantener estado entre llamadas"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OllamaClientSingleton, cls).__new__(cls)
            # Inicialización al crear la instancia
            cls._instance._model = os.getenv("OLLAMA_MODEL", "gemma3:4b")
            cls._instance._base_url = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        return cls._instance

class OllamaClient:
    """Cliente para interactuar con Ollama"""
    
    _singleton = OllamaClientSingleton()
    
    @property
    def model(self) -> str:
        """Obtener el modelo actual"""
        return self._singleton._model
    
    @model.setter
    def model(self, value: str) -> None:
        """Establecer el modelo actual y guardarlo"""
        self._singleton._model = value
        logger.info(f"Modelo cambiado a {value}")
    
    def get_response(self, prompt: str) -> str:
        """
        Obtener respuesta de Ollama para un prompt dado
        
        Args:
            prompt: Texto del prompt para el modelo
            
        Returns:
            Respuesta generada por el modelo
        """
        try:
            url = f"{self._singleton._base_url}/api/generate"
            
            # Datos de la solicitud
            data = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
            
            logger.info(f"Enviando prompt a Ollama (modelo: {self.model})")
            
            # Realizar solicitud a Ollama
            response = requests.post(url, json=data, timeout=120)  # Timeout extendido para modelos grandes
            response.raise_for_status()
            
            result = response.json()
            
            if 'response' in result:
                logger.info(f"Respuesta recibida de Ollama ({len(result['response'])} caracteres)")
                return result['response']
            else:
                logger.error(f"Respuesta de Ollama no contiene campo 'response': {result}")
                return "Error: Respuesta inesperada del modelo."
                
        except requests.RequestException as e:
            logger.error(f"Error al comunicarse con Ollama: {str(e)}")
            raise Exception(f"Error de comunicación con Ollama: {str(e)}")
        except Exception as e:
            logger.error(f"Error al obtener respuesta de Ollama: {str(e)}")
            raise Exception(f"Error al procesar respuesta de Ollama: {str(e)}")
    
    def get_models(self) -> List[str]:
        """
        Obtener lista de modelos disponibles en Ollama
        
        Returns:
            Lista de nombres de modelos
        """
        try:
            url = f"{self._singleton._base_url}/api/tags"
            
            logger.info("Obteniendo lista de modelos de Ollama")
            
            # Realizar solicitud a Ollama
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            
            if 'models' in result:
                # Extraer sólo los nombres de los modelos
                model_names = [model['name'] for model in result['models']]
                logger.info(f"Modelos disponibles: {model_names}")
                return model_names
            else:
                logger.error(f"Respuesta de Ollama no contiene campo 'models': {result}")
                return []
                
        except requests.RequestException as e:
            logger.error(f"Error al comunicarse con Ollama: {str(e)}")
            raise Exception(f"Error de comunicación con Ollama: {str(e)}")
        except Exception as e:
            logger.error(f"Error al obtener lista de modelos: {str(e)}")
            raise Exception(f"Error al procesar lista de modelos: {str(e)}")
    
    def get_model_info(self, model_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Obtener información sobre un modelo específico.
        
        Args:
            model_name: Nombre del modelo
            
        Returns:
            Información del modelo
        """
        model = model_name or self.model
        try:
            response = requests.post(
                f"{self._singleton._base_url}/api/show",
                json={"name": model}
            )
            return response.json()
        except Exception as e:
            logger.error(f"Error al obtener información del modelo {model}: {str(e)}")
            return {} 