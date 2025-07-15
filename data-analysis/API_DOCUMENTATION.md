# Documentación de la API de Análisis de Datos

Esta API proporciona endpoints para interactuar con los datos de los sensores, realizar análisis con IA y gestionar los resultados.

## Endpoints

A continuación se detallan los endpoints disponibles:

### 1. `GET /`

- **Propósito:** Endpoint raíz que muestra un mensaje de bienvenida y confirma que la API está en funcionamiento.
- **Parámetros:** Ninguno.
- **Respuesta exitosa (200):**
  ```json
  {
    "message": "API de Análisis de Datos de Sensores"
  }
  ```

### 2. `GET /procesar-datos`

- **Propósito:** Orquesta el proceso completo de obtención de datos de un sensor, su almacenamiento en la base de datos, la generación de un análisis por IA a través de Ollama y el almacenamiento de dicho análisis.
- **Parámetros:** Ninguno.
- **Respuesta exitosa (200):**
  ```json
  {
    "message": "Datos procesados correctamente",
    "data_id": 123,
    "response_id": 456,
    "response": "El análisis de la IA sobre los datos del sensor..."
  }
  ```
- **Respuesta de error (500):** Si falla algún paso del proceso.

### 3. `GET /respuestas`

- **Propósito:** Obtiene una lista paginada de los resultados de análisis de IA almacenados.
- **Parámetros:**
  - `limit` (opcional, int, por defecto: 10): Número máximo de resultados a devolver.
- **Respuesta exitosa (200):**
  ```json
  [
    {
      "id": 456,
      "sensor_data_id": 123,
      "analysis_response": "El análisis de la IA...",
      "timestamp": "2025-07-15T10:30:00Z"
    }
  ]
  ```

### 4. `GET /respuestas/{response_id}`

- **Propósito:** Obtiene un resultado de análisis específico por su ID.
- **Parámetros:**
  - `response_id` (requerido, int): El ID del análisis a obtener.
- **Respuesta exitosa (200):**
  ```json
  {
    "id": 456,
    "sensor_data_id": 123,
    "analysis_response": "El análisis de la IA...",
    "timestamp": "2025-07-15T10:30:00Z"
  }
  ```
- **Respuesta de error (404):** Si no se encuentra el análisis.

### 5. `GET /modelos`

- **Propósito:** Lista los modelos de lenguaje disponibles en el servicio de Ollama.
- **Respuesta exitosa (200):**
  ```json
  {
    "modelos": [
      {
        "nombre": "gemma3:4b",
        "activo": true,
        "detalles": {}
      }
    ],
    "modelo_activo": "gemma3:4b"
  }
  ```

### 6. `POST /cambiar-modelo/{nombre_modelo}`

- **Propósito:** Cambia el modelo de lenguaje activo que utiliza Ollama para los análisis.
- **Parámetros:**
  - `nombre_modelo` (requerido, string): El nombre del modelo a activar (ej. "gemma3:4b").
  - `descargar` (opcional, bool, por defecto: false): Intenta descargar el modelo si no está disponible localmente (actualmente no soportado).
- **Respuesta exitosa (200):**
  ```json
  {
    "mensaje": "Modelo cambiado correctamente a gemma3:4b",
    "modelo": "gemma3:4b"
  }
  ```
- **Respuesta de error (404):** Si el modelo no está disponible.

### 7. `GET /sensor-data`

- **Propósito:** Endpoint diseñado específicamente para la aplicación frontend (React Native/Expo), que devuelve los últimos registros de sensores en un formato fácil de consumir.
- **Parámetros:**
  - `limit` (opcional, int, por defecto: 5): Número de registros a devolver.
- **Respuesta exitosa (200):**
  ```json
  {
    "message": "Datos obtenidos correctamente",
    "count": 1,
    "data": [
      {
        "timestamp": "2025-07-15T10:30:00Z",
        "record_id": 123,
        "sensor_bmp390": { ... },
        "sensor_ltr390": { ... },
        ...
      }
    ]
  }
  ```
