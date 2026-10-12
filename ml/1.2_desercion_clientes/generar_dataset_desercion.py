"""
Modulo 1.2: Preparacion de Datos para Entrenamiento de Desercion de Clientes (Churn Prediction)
Belle Barre Studio - Sistema Belle-APP
"""

import json
import random
import os
import csv

def generar_dataset_desercion(num_registros=1200, ruta_salida="dataset_desercion.csv"):
    random.seed(42)
    
    headers = [
        "cliente_id",
        "dias_sin_asistir",
        "racha_semanas_activas",
        "clases_asistidas_total",
        "cancelaciones_ultimo_mes",
        "dias_membresia_restantes",
        "promedio_clases_semanales",
        "puntuacion_satisfaccion",
        "es_membresia_unlimited",
        "deserto"
    ]
    
    registros = []
    
    for i in range(1, num_registros + 1):
        tipo_perfil = random.choices(["fiel", "regular", "en_riesgo", "inactivo"], weights=[0.4, 0.3, 0.2, 0.1])[0]
        
        if tipo_perfil == "fiel":
            dias_sin_asistir = random.randint(0, 5)
            racha_semanas = random.randint(6, 24)
            clases_total = random.randint(20, 80)
            cancelaciones = random.randint(0, 1)
            dias_membresia = random.randint(10, 30)
            promedio_semanal = round(random.uniform(2.5, 5.0), 1)
            satisfaccion = random.randint(8, 10)
            unlimited = 1 if random.random() > 0.3 else 0
            deserto = 0
            
        elif tipo_perfil == "regular":
            dias_sin_asistir = random.randint(4, 12)
            racha_semanas = random.randint(2, 10)
            clases_total = random.randint(8, 30)
            cancelaciones = random.randint(0, 2)
            dias_membresia = random.randint(5, 25)
            promedio_semanal = round(random.uniform(1.5, 3.0), 1)
            satisfaccion = random.randint(6, 9)
            unlimited = 1 if random.random() > 0.5 else 0
            deserto = 0 if random.random() > 0.2 else 1
            
        elif tipo_perfil == "en_riesgo":
            dias_sin_asistir = random.randint(14, 30)
            racha_semanas = random.randint(0, 3)
            clases_total = random.randint(3, 15)
            cancelaciones = random.randint(2, 5)
            dias_membresia = random.randint(0, 10)
            promedio_semanal = round(random.uniform(0.5, 1.5), 1)
            satisfaccion = random.randint(4, 7)
            unlimited = 0
            deserto = 1 if random.random() > 0.25 else 0
            
        else:
            dias_sin_asistir = random.randint(31, 90)
            racha_semanas = 0
            clases_total = random.randint(1, 10)
            cancelaciones = random.randint(3, 7)
            dias_membresia = 0
            promedio_semanal = round(random.uniform(0.0, 0.5), 1)
            satisfaccion = random.randint(2, 6)
            unlimited = 0
            deserto = 1

        registros.append([
            i,
            dias_sin_asistir,
            racha_semanas,
            clases_total,
            cancelaciones,
            dias_membresia,
            promedio_semanal,
            satisfaccion,
            unlimited,
            deserto
        ])
    
    os.makedirs(os.path.dirname(os.path.abspath(ruta_salida)), exist_ok=True)
    with open(ruta_salida, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(registros)
        
    print(f"[OK] Dataset de Desercion creado con exito: {len(registros)} registros en {ruta_salida}")
    return ruta_salida

if __name__ == "__main__":
    generar_dataset_desercion(1200, "ml/1.2_desercion_clientes/dataset_desercion.csv")
