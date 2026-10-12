"""
Modulo 1.4: Preparacion del Dataset de Seguimiento Corporal (MediaPipe Pose / Belle Vision)
Belle Barre Studio - Sistema Belle-APP
"""

import csv
import math
import os
import random

def generar_dataset_pose(num_muestras=1000, ruta_salida="ml/1.4_seguimiento_corporal/dataset_pose_vision.csv"):
    random.seed(42)
    
    headers = [
        "muestra_id",
        "angulo_hombros",
        "angulo_caderas",
        "inclinacion_tronco",
        "simetria_rodillas",
        "confianza_mediapipe",
        "postura_etiqueta"
    ]
    
    muestras = []
    
    for i in range(1, num_muestras + 1):
        es_correcta = random.random() > 0.35
        
        if es_correcta:
            angulo_hombros = round(random.uniform(0.1, 2.5), 2)
            angulo_caderas = round(random.uniform(0.1, 2.8), 2)
            inclinacion_tronco = round(random.uniform(0.0, 2.0), 2)
            simetria_rodillas = round(random.uniform(90.0, 99.5), 1)
            confianza = round(random.uniform(0.88, 0.99), 3)
            etiqueta = 0
        else:
            angulo_hombros = round(random.uniform(3.5, 12.0), 2)
            angulo_caderas = round(random.uniform(4.0, 11.5), 2)
            inclinacion_tronco = round(random.uniform(3.2, 9.5), 2)
            simetria_rodillas = round(random.uniform(55.0, 85.0), 1)
            confianza = round(random.uniform(0.75, 0.94), 3)
            etiqueta = 1
            
        muestras.append([
            i,
            angulo_hombros,
            angulo_caderas,
            inclinacion_tronco,
            simetria_rodillas,
            confianza,
            etiqueta
        ])
        
    os.makedirs(os.path.dirname(os.path.abspath(ruta_salida)), exist_ok=True)
    with open(ruta_salida, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(muestras)
        
    print(f"[OK] Dataset de Seguimiento Corporal (Belle Vision) creado: {num_muestras} muestras en {ruta_salida}")
    return ruta_salida

if __name__ == "__main__":
    generar_dataset_pose()
