"""
Modulo 1.4: Generacion de Data Sintetica Coherente para Seguimiento Corporal
Belle Barre Studio - Sistema Belle-APP

Genera 1000 analisis posturales sinteticos coherentes con:
- El unico dato real de Azure SQL (dbo.VisionAnalisis): postura Adecuada, angulo_hombros=2.1, inclinacion=1.4, confianza=0.94
- Los umbrales biomecanicos reales de Belle Vision (MediaPipe Pose)
- 4 perfiles de bailarinas Barre del estudio

Perfiles de distribucion:
  30%  - Excelente alineacion (todo dentro del rango optimo)
  35%  - Buena postura (ligeras desviaciones aceptables)
  25%  - Postura a corregir (algunas metricas fuera del umbral)
  10%  - Desalineacion severa (varios puntos criticos)
"""

import csv
import os
import random
import json
import math

# Semilla fija para reproducibilidad
random.seed(2024)

# Umbrales biomecanicos reales del sistema Belle Vision
UMBRAL_ANGULO_HOMBROS  = 3.0   # grados maximo para postura correcta
UMBRAL_ANGULO_CADERAS  = 3.2   # grados maximo
UMBRAL_INCLINACION     = 2.5   # grados maximo
UMBRAL_SIMETRIA_MIN    = 88.0  # porcentaje minimo de simetria rodillas

# Nombres de diagnosticos reales del sistema
DIAGNOSTICOS_CORRECTA = [
    "Alineacion simetrica excelente entre hombros y pelvis.",
    "Postura de barre correcta. Hombros y caderas alineados.",
    "Excelente distribucion del peso. Columna alineada verticalmente.",
    "Equilibrio postural optimo detectado. Sin correcciones necesarias.",
    "Simetria bilateral dentro de parametros Barre Fit.",
    "Columna vertebral en eje neutro. Postura de clase ideal.",
]

DIAGNOSTICOS_LEVE = [
    "Leve inclinacion en hombros izquierdo. Ajuste menor recomendado.",
    "Tension detectada en zona lumbar derecha. Revisar apoyo.",
    "Ligera asimetria en caderas. Continuar ejercicios de alineacion.",
    "Inclinacion de tronco dentro del rango aceptable con mejora posible.",
    "Hombros ligeramente adelantados. Trabajar apertura de pecho.",
]

DIAGNOSTICOS_CORRECCION = [
    "Inclinacion de tronco fuera del rango ideal. Se recomienda correccion postural.",
    "Asimetria de caderas detectada. Revisar apoyo en barra.",
    "Hombros desalineados. Ejercicios de movilidad toracica recomendados.",
    "Simetria de rodillas por debajo del umbral. Trabajar equilibrio.",
    "Compensacion lumbar detectada. Ajustar posicion de pie.",
]

DIAGNOSTICOS_SEVERA = [
    "Desalineacion significativa detectada. Consultar con instructora.",
    "Multiple desviacion postural. Sesion de correccion urgente.",
    "Inclinacion severa de tronco. Riesgo de lesion si continua.",
    "Hombros y caderas desalineados. Revision completa necesaria.",
    "Asimetria critica en rodillas. Recomendamos fisioterapia.",
]

RECOMENDACIONES_CORRECTA = [
    "Mantener habitos actuales y practicar Barre Fit regularmente.",
    "Continuar con la rutina actual. Postura ejemplar.",
    "Sigue asi. Tu alineacion es un modelo a seguir en clase.",
]

RECOMENDACIONES_LEVE = [
    "Practicar estiramientos de hombros antes de cada clase.",
    "Revisar posicion de pies en la barra. Pequeno ajuste de cadera.",
    "Fortalecer core para mantener alineacion durante ejercicios.",
]

RECOMENDACIONES_CORRECCION = [
    "Sesion de correccion postural con instructora recomendada.",
    "Reducir carga en ejercicios complejos hasta mejorar alineacion.",
    "Ejercicios especificos de movilidad toracica y lumbar.",
]

RECOMENDACIONES_SEVERA = [
    "Consultar con fisioterapeuta antes de continuar clases.",
    "Pausar ejercicios avanzados y trabajar en postura basica.",
    "Evaluacion medica recomendada antes de la proxima clase.",
]

# Usuarios simulados (IDs de dbo.Usuarios, solo hay 9 reales; para sintetico usamos rango 1-9)
IDS_USUARIO = list(range(1, 10))

def generar_fecha_aleatoria():
    """Genera fecha aleatoria en los ultimos 6 meses."""
    mes = random.randint(4, 9)  # Abril a Septiembre 2026
    dia = random.randint(1, 28)
    hora = random.randint(8, 20)
    minuto = random.randint(0, 59)
    segundo = random.randint(0, 59)
    ms = random.randint(100000, 999999)
    return f"2026-{mes:02d}-{dia:02d}T{hora:02d}:{minuto:02d}:{segundo:02d}.{ms}"

def generar_muestra_excelente():
    """Perfil 1: Excelente alineacion (30% del dataset)."""
    angulo_hombros = round(random.uniform(0.1, 1.8), 2)
    angulo_caderas = round(random.uniform(0.1, 2.0), 2)
    inclinacion    = round(random.uniform(0.0, 1.5), 2)
    simetria       = round(random.uniform(94.0, 99.5), 1)
    confianza      = round(random.uniform(0.91, 0.99), 3)
    postura        = "Adecuada"
    diagnostico    = random.choice(DIAGNOSTICOS_CORRECTA)
    recomendacion  = random.choice(RECOMENDACIONES_CORRECTA)
    return angulo_hombros, angulo_caderas, inclinacion, simetria, confianza, postura, diagnostico, recomendacion

def generar_muestra_buena():
    """Perfil 2: Buena postura con ligeras desviaciones (35% del dataset)."""
    angulo_hombros = round(random.uniform(1.5, 2.9), 2)
    angulo_caderas = round(random.uniform(1.5, 3.1), 2)
    inclinacion    = round(random.uniform(1.0, 2.4), 2)
    simetria       = round(random.uniform(88.5, 94.0), 1)
    confianza      = round(random.uniform(0.86, 0.94), 3)
    postura        = "Adecuada"
    diagnostico    = random.choice(DIAGNOSTICOS_LEVE)
    recomendacion  = random.choice(RECOMENDACIONES_LEVE)
    return angulo_hombros, angulo_caderas, inclinacion, simetria, confianza, postura, diagnostico, recomendacion

def generar_muestra_correccion():
    """Perfil 3: Postura a corregir - algunas metricas fuera del umbral (25% del dataset)."""
    angulo_hombros = round(random.uniform(3.1, 6.5), 2)
    angulo_caderas = round(random.uniform(3.3, 7.0), 2)
    inclinacion    = round(random.uniform(2.6, 5.5), 2)
    simetria       = round(random.uniform(78.0, 87.9), 1)
    confianza      = round(random.uniform(0.78, 0.88), 3)
    postura        = "Inadecuada"
    diagnostico    = random.choice(DIAGNOSTICOS_CORRECCION)
    recomendacion  = random.choice(RECOMENDACIONES_CORRECCION)
    return angulo_hombros, angulo_caderas, inclinacion, simetria, confianza, postura, diagnostico, recomendacion

def generar_muestra_severa():
    """Perfil 4: Desalineacion severa (10% del dataset)."""
    angulo_hombros = round(random.uniform(6.5, 14.0), 2)
    angulo_caderas = round(random.uniform(7.0, 13.5), 2)
    inclinacion    = round(random.uniform(5.5, 11.0), 2)
    simetria       = round(random.uniform(55.0, 77.9), 1)
    confianza      = round(random.uniform(0.70, 0.82), 3)
    postura        = "Inadecuada"
    diagnostico    = random.choice(DIAGNOSTICOS_SEVERA)
    recomendacion  = random.choice(RECOMENDACIONES_SEVERA)
    return angulo_hombros, angulo_caderas, inclinacion, simetria, confianza, postura, diagnostico, recomendacion

def generar_dataset_sintetico(num_muestras=1000):
    """Genera num_muestras analisis posturales sinteticos coherentes."""
    print(f"[INICIO] Generando {num_muestras} analisis posturales sinteticos coherentes...")
    print(f"         Basado en dato real Azure: postura Adecuada, angulo_hombros=2.1, inclinacion=1.4, confianza=0.94")
    print()

    # Calcular cuantos de cada perfil
    n_excelente  = int(num_muestras * 0.30)  # 300
    n_buena      = int(num_muestras * 0.35)  # 350
    n_correccion = int(num_muestras * 0.25)  # 250
    n_severa     = num_muestras - n_excelente - n_buena - n_correccion  # 100

    print(f"  Perfil 1 - Excelente alineacion:   {n_excelente} muestras (30%)")
    print(f"  Perfil 2 - Buena postura:           {n_buena} muestras (35%)")
    print(f"  Perfil 3 - Postura a corregir:      {n_correccion} muestras (25%)")
    print(f"  Perfil 4 - Desalineacion severa:    {n_severa} muestras (10%)")
    print()

    muestras = []

    # Generar por perfil
    generadores = (
        [generar_muestra_excelente]  * n_excelente  +
        [generar_muestra_buena]      * n_buena      +
        [generar_muestra_correccion] * n_correccion +
        [generar_muestra_severa]     * n_severa
    )
    random.shuffle(generadores)

    for i, generador in enumerate(generadores, start=2):  # IDs sinteticos desde 2 (el 1 es Azure real)
        angulo_hombros, angulo_caderas, inclinacion, simetria, confianza, postura, diagnostico, recomendacion = generador()
        muestras.append({
            "id": i,
            "usuario_id": random.choice(IDS_USUARIO),
            "postura": postura,
            "angulo_hombros": angulo_hombros,
            "angulo_caderas": angulo_caderas,
            "inclinacion": inclinacion,
            "simetria_rodillas": simetria,
            "confianza": confianza,
            "diagnostico": diagnostico,
            "recomendacion": recomendacion,
            "fecha_analisis": generar_fecha_aleatoria(),
            "origen": "sintetico_coherente"
        })

    return muestras

def guardar_dataset(muestras, ruta_salida):
    """Guarda el dataset en CSV."""
    os.makedirs(os.path.dirname(os.path.abspath(ruta_salida)), exist_ok=True)
    headers = ["id","usuario_id","postura","angulo_hombros","angulo_caderas","inclinacion",
               "simetria_rodillas","confianza","diagnostico","recomendacion","fecha_analisis","origen"]
    with open(ruta_salida, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(muestras)
    print(f"[OK] Dataset guardado: {ruta_salida}")

def crear_dataset_aumentado(ruta_azure, ruta_sintetico, ruta_aumentado):
    """Combina el dato real de Azure con los sinteticos."""
    filas = []

    # Primero el dato real de Azure
    with open(ruta_azure, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row["angulo_caderas"] = "2.1"   # estimado coherente
            row["simetria_rodillas"] = "96.5"  # estimado coherente (postura Adecuada)
            row["origen"] = "azure_sql_real"
            filas.append(row)

    # Luego los sinteticos
    with open(ruta_sintetico, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            filas.append(row)

    headers = ["id","usuario_id","postura","angulo_hombros","angulo_caderas","inclinacion",
               "simetria_rodillas","confianza","diagnostico","recomendacion","fecha_analisis","origen"]

    os.makedirs(os.path.dirname(os.path.abspath(ruta_aumentado)), exist_ok=True)
    with open(ruta_aumentado, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(filas)

    print(f"[OK] Dataset aumentado: {len(filas)} registros totales -> {ruta_aumentado}")
    return len(filas)

def generar_reporte_distribucion(muestras):
    """Muestra estadisticas del dataset generado."""
    total = len(muestras)
    adecuadas   = sum(1 for m in muestras if m["postura"] == "Adecuada")
    inadecuadas = sum(1 for m in muestras if m["postura"] == "Inadecuada")

    angulos_h = [m["angulo_hombros"] for m in muestras]
    angulos_c = [m["angulo_caderas"] for m in muestras]
    inclinaciones = [m["inclinacion"] for m in muestras]
    simetrias = [m["simetria_rodillas"] for m in muestras]

    print()
    print("=" * 55)
    print("  REPORTE DE DISTRIBUCION - DATA SINTETICA POSE")
    print("=" * 55)
    print(f"  Total muestras sinteticas:   {total}")
    print(f"  Posturas Adecuadas:          {adecuadas} ({adecuadas/total*100:.1f}%)")
    print(f"  Posturas Inadecuadas:        {inadecuadas} ({inadecuadas/total*100:.1f}%)")
    print()
    print(f"  Angulo Hombros  - Min: {min(angulos_h):.2f} | Max: {max(angulos_h):.2f} | Prom: {sum(angulos_h)/total:.2f}")
    print(f"  Angulo Caderas  - Min: {min(angulos_c):.2f} | Max: {max(angulos_c):.2f} | Prom: {sum(angulos_c)/total:.2f}")
    print(f"  Inclinacion     - Min: {min(inclinaciones):.2f} | Max: {max(inclinaciones):.2f} | Prom: {sum(inclinaciones)/total:.2f}")
    print(f"  Simetria Rodil. - Min: {min(simetrias):.1f} | Max: {max(simetrias):.1f} | Prom: {sum(simetrias)/total:.1f}")
    print("=" * 55)

if __name__ == "__main__":
    BASE = "ml/1.4_seguimiento_corporal"
    RUTA_AZURE     = f"{BASE}/dataset_pose_azure.csv"
    RUTA_SINTETICO = f"{BASE}/dataset_pose_sintetico_1000.csv"
    RUTA_AUMENTADO = f"{BASE}/dataset_pose_aumentado_1001.csv"

    # 1. Generar 1000 muestras sinteticas
    muestras = generar_dataset_sintetico(1000)

    # 2. Guardar dataset sintetico
    guardar_dataset(muestras, RUTA_SINTETICO)

    # 3. Combinar con dato real de Azure
    total = crear_dataset_aumentado(RUTA_AZURE, RUTA_SINTETICO, RUTA_AUMENTADO)

    # 4. Reporte de distribucion
    generar_reporte_distribucion(muestras)

    print()
    print("[COMPLETADO] Data sintetica de seguimiento corporal generada.")
    print(f"  - Sintetico:  {RUTA_SINTETICO} (1000 registros)")
    print(f"  - Aumentado:  {RUTA_AUMENTADO} ({total} registros = 1 real + 1000 sinteticos)")
    print()
    print("Siguiente paso: ejecutar entrenamiento_pose_vision.py para reentrenar el modelo.")
