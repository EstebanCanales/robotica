import requests
import json
import time

# URL del servicio de datos falsos (asegúrate de que esté en ejecución)
URL = "http://localhost:8080/datos"
NUM_RECORDS = 1000
OUTPUT_FILE = "test_dataset_1000_records.json"

def generate_dataset():
    """
    Llama al endpoint de datos falsos repetidamente para generar un gran conjunto de datos.
    """
    dataset = []
    print(f"Generando {NUM_RECORDS} registros desde {URL}...")

    for i in range(NUM_RECORDS):
        try:
            response = requests.get(URL)
            response.raise_for_status()  # Lanza un error para respuestas 4xx/5xx
            dataset.append(response.json())
            
            # Imprimir progreso
            print(f"Registro {i + 1}/{NUM_RECORDS} generado.", end='\r')

        except requests.RequestException as e:
            print(f"\nError al contactar el servicio de datos falsos: {e}")
            print("Asegúrate de que el servicio esté en ejecución ejecutando 'python main.py' en el directorio 'fake-data'.")
            return
        
        # Pequeña pausa para no sobrecargar el servicio
        time.sleep(0.01)

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"\n¡Éxito! Se ha guardado un conjunto de datos con {len(dataset)} registros en '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    generate_dataset()
