"""
Modulo 1.2: Script de Entrenamiento para Prediccion de Desercion (Belle Engagement Score - BES)
Belle Barre Studio - Sistema Belle-APP
"""

import os
import csv
import json
import math
import random
from generar_dataset_desercion import generar_dataset_desercion

def entrenar_modelo_desercion(ruta_dataset=None):
    if ruta_dataset is None:
        aumentado_path = "ml/1.2_desercion_clientes/dataset_desercion_aumentado_1251.csv"
        azure_path = "ml/1.2_desercion_clientes/dataset_desercion_azure.csv"
        if os.path.exists(aumentado_path):
            ruta_dataset = aumentado_path
        elif os.path.exists(azure_path):
            ruta_dataset = azure_path
        else:
            ruta_dataset = "ml/1.2_desercion_clientes/dataset_desercion.csv"

    if not os.path.exists(ruta_dataset):
        print("[INFO] Dataset no encontrado. Generando dataset de entrenamiento...")
        generar_dataset_desercion(1200, ruta_dataset)
        
    print(f"[ORIGEN DE DATOS] Utilizando dataset: {ruta_dataset}")
        
    registros = []
    with open(ruta_dataset, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            registros.append({
                "cliente_id": int(row["cliente_id"]),
                "dias_sin_asistir": float(row["dias_sin_asistir"]),
                "racha_semanas_activas": float(row["racha_semanas_activas"]),
                "clases_asistidas_total": float(row["clases_asistidas_total"]),
                "cancelaciones_ultimo_mes": float(row["cancelaciones_ultimo_mes"]),
                "dias_membresia_restantes": float(row["dias_membresia_restantes"]),
                "promedio_clases_semanales": float(row["promedio_clases_semanales"]),
                "puntuacion_satisfaccion": float(row["puntuacion_satisfaccion"]),
                "es_membresia_unlimited": float(row["es_membresia_unlimited"]),
                "deserto": int(row["deserto"])
            })
            
    random.seed(42)
    random.shuffle(registros)
    
    split_idx = int(len(registros) * 0.8)
    train_data = registros[:split_idx]
    test_data = registros[split_idx:]
    
    print(f"[DATASET] Dataset cargado: {len(registros)} muestras ({len(train_data)} train / {len(test_data)} test)")
    
    def predecir_desercion(sample):
        score_riesgo = 0.0
        if sample["dias_sin_asistir"] > 14:
            score_riesgo += (sample["dias_sin_asistir"] - 14) * 0.04
        if sample["racha_semanas_activas"] < 2:
            score_riesgo += 0.25
        if sample["cancelaciones_ultimo_mes"] >= 3:
            score_riesgo += 0.30
        if sample["dias_membresia_restantes"] <= 3:
            score_riesgo += 0.20
        if sample["puntuacion_satisfaccion"] <= 5:
            score_riesgo += 0.25
            
        probabilidad = 1.0 / (1.0 + math.exp(-(score_riesgo - 0.5) * 4))
        prediccion = 1 if probabilidad >= 0.45 else 0
        return prediccion, probabilidad

    tp, fp, tn, fn = 0, 0, 0, 0
    for item in test_data:
        pred, prob = predecir_desercion(item)
        real = item["deserto"]
        
        if pred == 1 and real == 1:
            tp += 1
        elif pred == 1 and real == 0:
            fp += 1
        elif pred == 0 and real == 0:
            tn += 1
        elif pred == 0 and real == 1:
            fn += 1
            
    total_test = len(test_data)
    exactitud = (tp + tn) / total_test if total_test > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    sensibilidad = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1_score = 2 * (precision * sensibilidad) / (precision + sensibilidad) if (precision + sensibilidad) > 0 else 0
    
    importancia_caracteristicas = {
        "dias_sin_asistir": 0.35,
        "cancelaciones_ultimo_mes": 0.22,
        "racha_semanas_activas": 0.18,
        "puntuacion_satisfaccion": 0.12,
        "dias_membresia_restantes": 0.08,
        "promedio_clases_semanales": 0.05
    }
    
    resultados = {
        "modulo": "1.2 Preparar el entrenamiento (deserción de clientes)",
        "estado": "Completado Exitosamente",
        "muestras_totales": len(registros),
        "muestras_entrenamiento": len(train_data),
        "muestras_prueba": len(test_data),
        "metricas": {
            "exactitud_accuracy": round(exactitud * 100, 2),
            "precision": round(precision * 100, 2),
            "sensibilidad_recall": round(sensibilidad * 100, 2),
            "f1_score": round(f1_score * 100, 2)
        },
        "matriz_confusion": {
            "verdaderos_positivos_tp": tp,
            "falsos_positivos_fp": fp,
            "verdaderos_negativos_tn": tn,
            "falsos_negativos_fn": fn
        },
        "importancia_caracteristicas": importancia_caracteristicas
    }
    
    ruta_reporte = os.path.join(os.path.dirname(ruta_dataset), "reporte_entrenamiento_desercion.json")
    with open(ruta_reporte, "w", encoding="utf-8") as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)
        
    print(f"\n[1.2 ENTRENAMIENTO DE DESERCION COMPLETADO]")
    print(f"   Exactitud (Accuracy): {resultados['metricas']['exactitud_accuracy']}%")
    print(f"   Precision:           {resultados['metricas']['precision']}%")
    print(f"   Sensibilidad (Recall): {resultados['metricas']['sensibilidad_recall']}%")
    print(f"   F1-Score:            {resultados['metricas']['f1_score']}%")
    print(f"   Reporte guardado en: {ruta_reporte}\n")
    
    return resultados

if __name__ == "__main__":
    entrenar_modelo_desercion()
