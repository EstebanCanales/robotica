import unittest
import time
import os
import json
from app.db.manager import DBManager

class TestDBPerformance(unittest.TestCase):

    def setUp(self):
        """Configura una base de datos en memoria para las pruebas."""
        self.db_manager = DBManager(db_path=":memory:")
        self.populate_data()

    def tearDown(self):
        """Cierra la conexión a la base de datos después de las pruebas."""
        self.db_manager.close()

    def populate_data(self):
        """Puebla la base de datos con 30,000 registros de prueba."""
        print("\nPopulando la base de datos con 30,000 registros... (esto puede tardar un momento)")
        # El método anterior con transacciones fallaba porque el DBManager hace commit en cada llamada.
        # Esta aproximación es más lenta para el setup del test, pero refleja el uso real del manager.
        for i in range(30000):
            sensor_data = {"sensor": "test", "value": i}
            data_id = self.db_manager.save_sensor_data(json.dumps(sensor_data))
            self.db_manager.save_analysis_result(data_id, f"Análisis para el valor {i}")
        print("Población de datos completada.")

    def test_query_performance(self):
        """Prueba el rendimiento de la consulta para obtener resultados de análisis."""
        # Medir el tiempo de ejecución de la consulta
        start_time = time.time()
        results = self.db_manager.get_analysis_results(limit=100)
        end_time = time.time()

        duration_ms = (end_time - start_time) * 1000

        print(f"La consulta de {len(results)} resultados tomó {duration_ms:.2f} ms.")

        # Verificar que la duración sea inferior a 100 ms
        self.assertTrue(len(results) > 0, "La consulta no devolvió resultados.")
        self.assertLess(duration_ms, 100, f"La consulta tardó {duration_ms:.2f} ms, lo cual es más de 100 ms.")

if __name__ == '__main__':
    unittest.main()