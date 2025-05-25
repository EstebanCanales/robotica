from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
import random

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/datos")
async def get_datos():
    """Devuelve datos simulados de sensores y clima."""
    return {
        "timestamp": datetime.now().isoformat(),
        "sensor_bmp390": {
            "presion_hPa": random.uniform(880.0, 900.0),
            "temperatura_a": random.uniform(22.0, 25.0)
        },
        "sensor_ltr390": {
            "luz_cruda": random.randint(70, 110),
            "uv_crudo": random.randint(0, 2),
            "lux": random.uniform(50.0, 90.0),
            "indice_uv": random.uniform(0.0, 1.0)
        },
        "sensor_scd30": {
            "co2_ppm": random.uniform(400.0, 500.0) if random.random() > 0.2 else None,
            "temperatura_b": random.uniform(22.0, 25.0) if random.random() > 0.2 else None,
            "humedad_pct": random.uniform(70.0, 90.0) if random.random() > 0.2 else None
        },
        "gps": {
            "latitud": 9.890018 + random.uniform(-0.001, 0.001),
            "longitud": -84.089006 + random.uniform(-0.001, 0.001)
        },
        "clima_satelital": {
            "T2M": random.uniform(22.0, 24.0),
            "T2M_MAX": random.uniform(25.0, 27.0),
            "T2M_MIN": random.uniform(20.0, 22.0),
            "T2M_RANGE": random.uniform(5.0, 6.0),
            "PRECTOTCORR": random.uniform(10.0, 15.0),
            "RH2M": random.uniform(85.0, 95.0),
            "QV2M": random.uniform(16.0, 18.0),
            "WS10M": random.uniform(0.5, 1.0),
            "WS10M_MAX": random.uniform(1.0, 1.5),
            "WS10M_MIN": random.uniform(0.1, 0.3),
            "T2MDEW": random.uniform(20.0, 22.0),
            "T2MWET": random.uniform(21.0, 23.0),
            "TS": random.uniform(22.0, 24.0),
            "ALLSKY_SFC_LW_DWN": random.uniform(36.0, 40.0),
            "ALLSKY_SFC_SW_DWN": random.uniform(10.0, 15.0),
            "CLRSKY_SFC_SW_DWN": -999.0,
            "ALLSKY_KT": -999.0,
            "EVLAND": random.uniform(2.5, 3.5),
            "PS": random.uniform(90.0, 95.0)
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080) 