"""
Generador de 1,000 Datos Sinteticos Coherentes con los 251 Clientes Reales de Azure SQL
Belle Barre Studio - Sistema Belle-APP (Modulo 1.2: Desercion de Clientes / Churn)
"""

import os
import csv
import random
import math

NOMBRES = [
    "Luciana", "Camila", "Valeria", "Romina", "Daniela", "Fiorella", "Andrea", "Mariana",
    "Natalia", "Jimena", "Adriana", "Carolina", "Gabriela", "Claudia", "Patricia", "Alejandra",
    "Estefania", "Fernanda", "Paola", "Ariana", "Micaela", "Brunella", "Lorena", "Renata",
    "Flavia", "Antonella", "Alessandra", "Macarena", "Paloma", "Solange", "Belén", "Alonso",
    "Sebastián", "Diego", "Rodrigo", "Mateo", "Joaquín", "Nicolás", "Fabrizio", "Gonzalo"
]

APELLIDOS = [
    "Mendoza", "Flores", "Salazar", "Reyes", "Castro", "Vargas", "Guzmán", "Morales",
    "Paredes", "Chávez", "Herrera", "Medina", "Rojas", "Romero", "Navarro", "Delgado",
    "Torres", "Vega", "Peña", "Cárdenas", "Cordova", "Alvarez", "Miranda", "Benites",
    "Castillo", "Montes", "Guerrero", "Pacheco", "Aguilar", "Campos", "Barrios", "Soto"
]

def generar_datos_sinteticos_coherentes(num_sinteticos=1000, 
                                        ruta_real="ml/1.2_desercion_clientes/dataset_desercion_azure.csv",
                                        ruta_salida="ml/1.2_desercion_clientes/dataset_desercion_aumentado_1251.csv"):
    random.seed(42)
    
    # 1. Cargar los datos reales existentes de Azure SQL
    registros_totales = []
    headers = []
    
    if os.path.exists(ruta_real):
        with open(ruta_real, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            headers = next(reader)
            for row in reader:
                registros_totales.append(row)
        print(f"[AZURE SQL] Se cargaron {len(registros_totales)} clientes reales desde {ruta_real}")
    else:
        headers = [
            "cliente_id", "nombre_completo", "dias_sin_asistir", "racha_semanas_activas",
            "clases_asistidas_total", "cancelaciones_ultimo_mes", "dias_membresia_restantes",
            "promedio_clases_semanales", "puntuacion_satisfaccion", "es_membresia_unlimited",
            "bes_puntaje", "deserto"
        ]

    # Encontrar ID maximo para continuar correlativamente
    max_id = 260
    for r in registros_totales:
        try:
            val = int(r[0])
            if val > max_id:
                max_id = val
        except:
            pass

    print(f"[GENERACION] Creando {num_sinteticos} registros sinteticos coherentes a partir del ID {max_id + 1}...")

    # 2. Generar 1,000 registros sinteticos respetando clusters de comportamiento de Barre
    # Perfiles: Comprometida (35%), Activa Regular (30%), Ocasional (20%), En Riesgo (10%), Desertora (5%)
    clusters = ["comprometida", "regular", "ocasional", "en_riesgo", "desertora"]
    pesos_clusters = [0.35, 0.30, 0.20, 0.10, 0.05]

    for i in range(1, num_sinteticos + 1):
        cliente_id = max_id + i
        nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)} {random.choice(APELLIDOS)}"
        perfil = random.choices(clusters, weights=pesos_clusters)[0]

        if perfil == "comprometida":
            dias_sin_asistir = random.randint(1, 4)
            racha_semanas = random.randint(6, 20)
            promedio_semanal = round(random.uniform(2.5, 4.5), 1)
            clases_total = int(max(racha_semanas * promedio_semanal, random.randint(18, 65)))
            cancelaciones = random.randint(0, 1)
            dias_membresia = random.randint(12, 30)
            satisfaccion = random.randint(8, 10)
            unlimited = 1 if random.random() > 0.3 else 0
            
        elif perfil == "regular":
            dias_sin_asistir = random.randint(4, 10)
            racha_semanas = random.randint(3, 8)
            promedio_semanal = round(random.uniform(1.8, 3.0), 1)
            clases_total = int(max(racha_semanas * promedio_semanal, random.randint(10, 35)))
            cancelaciones = random.randint(0, 2)
            dias_membresia = random.randint(6, 24)
            satisfaccion = random.randint(7, 9)
            unlimited = 1 if random.random() > 0.55 else 0

        elif perfil == "ocasional":
            dias_sin_asistir = random.randint(9, 16)
            racha_semanas = random.randint(1, 4)
            promedio_semanal = round(random.uniform(1.0, 2.0), 1)
            clases_total = int(random.randint(5, 18))
            cancelaciones = random.randint(1, 3)
            dias_membresia = random.randint(3, 16)
            satisfaccion = random.randint(6, 8)
            unlimited = 0

        elif perfil == "en_riesgo":
            dias_sin_asistir = random.randint(17, 28)
            racha_semanas = random.randint(0, 2)
            promedio_semanal = round(random.uniform(0.5, 1.2), 1)
            clases_total = int(random.randint(3, 12))
            cancelaciones = random.randint(2, 5)
            dias_membresia = random.randint(0, 8)
            satisfaccion = random.randint(4, 7)
            unlimited = 0

        else: # desertora
            dias_sin_asistir = random.randint(29, 75)
            racha_semanas = 0
            promedio_semanal = round(random.uniform(0.0, 0.5), 1)
            clases_total = int(random.randint(1, 8))
            cancelaciones = random.randint(3, 6)
            dias_membresia = 0
            satisfaccion = random.randint(2, 5)
            unlimited = 0

        # Calculo coherente del BES Puntaje (0 a 100)
        base_bes = 94.0 - (dias_sin_asistir * 1.6) + (racha_semanas * 1.4) - (cancelaciones * 3.5) + (promedio_semanal * 2.5) + (satisfaccion * 0.8)
        bes_puntaje = round(max(15.0, min(100.0, base_bes)), 1)

        # Regla coherente de Desercion (Target)
        if bes_puntaje >= 65 and dias_sin_asistir <= 14:
            deserto = 0
        elif bes_puntaje < 48 or dias_sin_asistir >= 22:
            deserto = 1
        else:
            # Zona intermedia (incertidumbre realista)
            prob_desercion = (65 - bes_puntaje) / 17.0
            deserto = 1 if random.random() < prob_desercion else 0

        registros_totales.append([
            cliente_id,
            nombre,
            dias_sin_asistir,
            racha_semanas,
            clases_total,
            cancelaciones,
            dias_membresia,
            promedio_semanal,
            satisfaccion,
            unlimited,
            bes_puntaje,
            deserto
        ])

    # 3. Guardar archivo consolidado (1,251 filas)
    os.makedirs(os.path.dirname(os.path.abspath(ruta_salida)), exist_ok=True)
    with open(ruta_salida, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(registros_totales)

    print("=" * 70)
    print(f"DATASET AUMENTADO GENERADO EXITOSAMENTE:")
    print(f"Total registros: {len(registros_totales)} (251 reales de Azure SQL + {num_sinteticos} sinteticos coherentes)")
    print(f"Archivo guardado en: {ruta_salida}")
    print("=" * 70)
    return ruta_salida

if __name__ == "__main__":
    generar_datos_sinteticos_coherentes()
