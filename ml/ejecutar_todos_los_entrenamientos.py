"""
Script Principal de Ejecucion de Entrenamientos ML/IA
Belle Barre Studio - Sistema Belle-APP

Ejecuta los tres modulos:
1.2 Preparar el entrenamiento (deserción de clientes)
1.3 Preparar el entrenamiento (chatbot, aprendizaje constante)
1.4 Preparar el entrenamiento (seguimiento corporal) (mejorar o revisar)
"""

import sys
import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(base_dir, "1.2_desercion_clientes"))
sys.path.append(os.path.join(base_dir, "1.3_chatbot_aprendizaje"))
sys.path.append(os.path.join(base_dir, "1.4_seguimiento_corporal"))

from entrenamiento_desercion import entrenar_modelo_desercion
from entrenamiento_chatbot import entrenar_modelo_chatbot
from entrenamiento_pose_vision import entrenar_modelo_pose

def ejecutar_todos():
    print("=" * 70)
    print("INICIANDO EJECUCION DE ENTRENAMIENTOS DE IA / MACHINE LEARNING")
    print("Sistema Belle-APP - Belle Barre Studio")
    print("=" * 70)
    
    # 1.2 Deserción
    print("\n--- [1/3] Modulo 1.2: Desercion de Clientes (BES & Churn) ---")
    res_desercion = entrenar_modelo_desercion(os.path.join(base_dir, "1.2_desercion_clientes", "dataset_desercion.csv"))
    
    # 1.3 Chatbot
    print("\n--- [2/3] Modulo 1.3: Chatbot & Aprendizaje Constante ---")
    res_chatbot = entrenar_modelo_chatbot(os.path.join(base_dir, "1.3_chatbot_aprendizaje", "dataset_chatbot.json"))
    
    # 1.4 Pose Vision
    print("\n--- [3/3] Modulo 1.4: Seguimiento Corporal (Belle Vision MediaPipe) ---")
    res_pose = entrenar_modelo_pose(os.path.join(base_dir, "1.4_seguimiento_corporal", "dataset_pose_vision.csv"))
    
    resumen_general = {
        "sistema": "Belle-APP ML & AI Suite",
        "estado_general": "Todos los Entrenamientos Completados",
        "modulos": [
            res_desercion,
            res_chatbot,
            res_pose
        ]
    }
    
    ruta_resumen = os.path.join(base_dir, "resumen_ejecucion_entrenamientos.json")
    with open(ruta_resumen, "w", encoding="utf-8") as f:
        json.dump(resumen_general, f, indent=2, ensure_ascii=False)
        
    print("\n" + "=" * 70)
    print("¡TODOS LOS ENTRENAMIENTOS SE EJECUTARON EXITOSAMENTE!")
    print(f"Modulo 1.2 (Desercion): Accuracy = {res_desercion['metricas']['exactitud_accuracy']}% | F1 = {res_desercion['metricas']['f1_score']}%")
    print(f"Modulo 1.3 (Chatbot):   Accuracy = {res_chatbot['metricas']['exactitud_intent_accuracy']}% | F1 = {res_chatbot['metricas']['f1_score_estimado']}%")
    print(f"Modulo 1.4 (Pose):      Accuracy = {res_pose['metricas']['exactitud_accuracy']}% | F1 = {res_pose['metricas']['f1_score']}%")
    print(f"Resumen consolidado guardado en: {ruta_resumen}")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    ejecutar_todos()
