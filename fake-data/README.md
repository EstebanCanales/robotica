# Servidor Fake Data

Este es un servidor FastAPI que simula datos de sensores y clima para pruebas de desarrollo.

## Instalación

```bash
pip install -r requirements.txt
```

## Ejecución

```bash
python main.py
```

El servidor estará disponible en http://localhost:8080

## Endpoints

- `/datos` - Devuelve datos simulados de sensores y clima en formato JSON

Ejemplo de respuesta:

```json
{
  "timestamp": "2025-05-20T13:58:35.908488",
  "sensor_bmp390": {
    "presion_hPa": 888.69,
    "temperatura_a": 23.34
  },
  "sensor_ltr390": {
    "luz_cruda": 90,
    "uv_crudo": 0,
    "lux": 72.0,
    "indice_uv": 0.0
  },
  "sensor_scd30": {
    "co2_ppm": 450.2,
    "temperatura_b": 23.1,
    "humedad_pct": 85.4
  },
  "gps": {
    "latitud": 9.890018,
    "longitud": -84.089006
  },
  "clima_satelital": {
    "T2M": 23.05,
    "T2M_MAX": 26.4,
    "T2M_MIN": 21.03,
    "T2M_RANGE": 5.37,
    "PRECTOTCORR": 12.52,
    "RH2M": 89.9,
    "QV2M": 16.96,
    "WS10M": 0.69,
    "WS10M_MAX": 1.38,
    "WS10M_MIN": 0.17,
    "T2MDEW": 21.22,
    "T2MWET": 22.14,
    "TS": 23.21,
    "ALLSKY_SFC_LW_DWN": 38.15,
    "ALLSKY_SFC_SW_DWN": 12.75,
    "CLRSKY_SFC_SW_DWN": -999.0,
    "ALLSKY_KT": -999.0,
    "EVLAND": 2.95,
    "PS": 93.39
  }
}
```
