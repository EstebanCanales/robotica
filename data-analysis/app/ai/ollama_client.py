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

class OllamaClient:
    """Cliente para interactuar con la API de Ollama."""
    
    def __init__(self, host=None, model=None):
        """
        Inicializar el cliente de Ollama.
        
        Args:
            host: URL del servidor de Ollama
            model: Modelo a utilizar
        """
        self.host = host or os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "gemma3:4b")
        self.api_url = f"{self.host}/api"
        
        logger.info(f"Cliente Ollama inicializado con host={self.host}, modelo={self.model}")
    
    def get_models(self) -> List[str]:
        """
        Obtener la lista de modelos disponibles.
        
        Returns:
            Lista de nombres de modelos
        """
        try:
            response = requests.get(f"{self.api_url}/tags")
            data = response.json()
            models = [model['name'] for model in data.get('models', [])]
            logger.info(f"Modelos disponibles: {len(models)} modelos")
            return models
        except Exception as e:
            logger.error(f"Error al obtener modelos: {str(e)}")
            return []
    
    def get_response(self, prompt: str, params: Optional[Dict[str, Any]] = None) -> str:
        """
        Obtener respuesta del modelo.
        
        Args:
            prompt: Prompt para enviar al modelo
            params: Parámetros adicionales para la generación
            
        Returns:
            Respuesta del modelo
        """
        if not prompt:
            logger.error("Prompt vacío")
            return "Error: El prompt no puede estar vacío"
        
        default_params = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 50,
            "max_tokens": 2048
        }
        
        # Combinar parámetros predeterminados con los proporcionados
        if params:
            default_params.update(params)
        
        # Eliminar cualquier parámetro None
        params_to_send = {k: v for k, v in default_params.items() if v is not None}
        
        try:
            logger.info(f"Enviando prompt a Ollama (modelo: {self.model}, longitud: {len(prompt)} caracteres)")
            logger.info(f"URL de la API: {self.api_url}/generate")
            logger.info(f"Parámetros: {json.dumps({k: v for k, v in params_to_send.items() if k != 'prompt'})}")
            
            # Para depuración, guardar el prompt en un archivo temporal
            try:
                with open("/tmp/last_prompt.txt", "w") as f:
                    f.write(prompt)
                logger.info("Prompt guardado en /tmp/last_prompt.txt para depuración")
            except Exception as e:
                logger.warning(f"No se pudo guardar el prompt para depuración: {str(e)}")
            
            start_time = time.time()
            response = requests.post(
                f"{self.api_url}/generate",
                json=params_to_send,
                timeout=300  # 5 minutos de timeout
            )
            response.raise_for_status()
            
            # Verificar si la respuesta es válida
            if response.status_code != 200:
                logger.error(f"Error en la respuesta de Ollama: {response.status_code}")
                return f"Error: Respuesta de Ollama no válida (código: {response.status_code})"
            
            # Extraer la respuesta
            try:
                data = response.json()
                generation_time = time.time() - start_time
                
                # Guardar respuesta para depuración
                try:
                    with open("/tmp/last_response.json", "w") as f:
                        json.dump(data, f, indent=2)
                    logger.info("Respuesta guardada en /tmp/last_response.json para depuración")
                except Exception as e:
                    logger.warning(f"No se pudo guardar la respuesta para depuración: {str(e)}")
                
                # Verificar si la respuesta contiene la clave 'response'
                if 'response' not in data:
                    logger.error(f"Respuesta de Ollama no contiene la clave 'response': {data}")
                    if isinstance(data, dict):
                        logger.info(f"Claves en la respuesta: {list(data.keys())}")
                    return f"Error: Formato de respuesta no válido. Claves disponibles: {list(data.keys()) if isinstance(data, dict) else 'ninguna'}"
                
                # Extraer y registrar métricas si están disponibles
                if 'eval_count' in data:
                    logger.info(f"Generación completada: {data.get('eval_count')} tokens evaluados en {generation_time:.2f} segundos")
                
                if 'total_duration' in data:
                    logger.info(f"Duración total reportada por Ollama: {data.get('total_duration')/1e9:.2f} segundos")
                
                logger.info(f"Respuesta obtenida de Ollama (longitud: {len(data.get('response', ''))} caracteres)")
                return data['response']
            except Exception as e:
                logger.error(f"Error al procesar la respuesta JSON: {str(e)}")
                # Intentar devolver la respuesta cruda si es posible
                try:
                    return f"Error al procesar la respuesta JSON: {str(e)}. Respuesta cruda: {response.text[:500]}"
                except:
                    return f"Error al procesar la respuesta JSON: {str(e)}"
        except requests.exceptions.Timeout:
            logger.error(f"Timeout al comunicarse con Ollama después de {300} segundos")
            return "Error: Tiempo de espera agotado al comunicarse con Ollama"
        except requests.exceptions.RequestException as e:
            logger.error(f"Error de conexión con Ollama: {str(e)}")
            return f"Error de conexión con Ollama: {str(e)}"
        except Exception as e:
            logger.error(f"Error inesperado al obtener respuesta de Ollama: {str(e)}")
            return f"Error inesperado: {str(e)}"
    
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
                f"{self.api_url}/show",
                json={"name": model}
            )
            return response.json()
        except Exception as e:
            logger.error(f"Error al obtener información del modelo {model}: {str(e)}")
            return {} 