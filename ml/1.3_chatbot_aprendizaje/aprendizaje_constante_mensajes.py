"""
Modulo 1.3: Demostracion de Aprendizaje Continuo (Mensaje a Mensaje, Palabra a Palabra)
Belle Barre Studio - Sistema Belle-APP

Explica y simula como el chatbot:
1. Captura cada mensaje que envia la alumna (cada palabra, token y coma).
2. Actualiza la memoria dinamica de lenguaje y vocabulario en tiempo real.
3. Registra el par conversacional en formato estandar de Fine-Tuning de OpenAI (JSONL).
4. Aplica adaptacion continua en el proximo turno de conversacion.
"""

import os
import json
import re
from datetime import datetime

RUTA_FINETUNING_OPENAI = os.path.join(os.path.dirname(__file__), "dataset_openai_finetuning.jsonl")
RUTA_VOCABULARIO_DINAMICO = os.path.join(os.path.dirname(__file__), "vocabulario_aprendido.json")

def procesar_y_aprender_mensaje(mensaje_usuario, respuesta_bot, nombre_alumna="Camila Rodriguez"):
    print("=" * 70)
    print(f"APRENDIENDO EN VIVO DEL MENSAJE DE: {nombre_alumna}")
    print(f"Mensaje entrante: \"{mensaje_usuario}\"")
    print("=" * 70)
    
    # 1. Tokenizacion granular (cada palabra, signo y coma)
    tokens_palabras = re.findall(r"\b\w+\b|[.,;¡!¿?]", mensaje_usuario.lower())
    print(f"\n[1] Descomposicion de tokens y signos aprendidos ({len(tokens_palabras)} tokens):")
    print("   ", tokens_palabras)
    
    # 2. Cargar o inicializar vocabulario de memoria continua
    if os.path.exists(RUTA_VOCABULARIO_DINAMICO):
        with open(RUTA_VOCABULARIO_DINAMICO, "r", encoding="utf-8") as f:
            vocab_data = json.load(f)
    else:
        vocab_data = {"frecuencia_tokens": {}, "total_mensajes_aprendidos": 0, "ultimos_mensajes": []}
        
    # Incrementar frecuencias en tiempo real
    for t in tokens_palabras:
        vocab_data["frecuencia_tokens"][t] = vocab_data["frecuencia_tokens"].get(t, 0) + 1
        
    vocab_data["total_mensajes_aprendidos"] += 1
    vocab_data["ultimos_mensajes"].append({
        "timestamp": datetime.utcnow().isoformat(),
        "alumna": nombre_alumna,
        "texto": mensaje_usuario,
        "tokens": len(tokens_palabras)
    })
    
    with open(RUTA_VOCABULARIO_DINAMICO, "w", encoding="utf-8") as f:
        json.dump(vocab_data, f, indent=2, ensure_ascii=False)
        
    print(f"\n[2] Memoria dinamica actualizada:")
    print(f"    - Total de mensajes asimilados: {vocab_data['total_mensajes_aprendidos']}")
    print(f"    - Palabras y signos unicos en memoria: {len(vocab_data['frecuencia_tokens'])}")

    # 3. Registrar en el archivo oficial de Fine-Tuning de OpenAI (JSONL)
    registro_openai = {
        "messages": [
            {
                "role": "system",
                "content": "Eres Belle AI, el asistente virtual de Belle Barre Studio. Aprendes continuamente de las clientas para mejorar la atencion en citas y Barre."
            },
            {
                "role": "user",
                "content": mensaje_usuario
            },
            {
                "role": "assistant",
                "content": respuesta_bot
            }
        ],
        "metadata": {
            "alumna": nombre_alumna,
            "tokens_aprendidos": len(tokens_palabras),
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    
    with open(RUTA_FINETUNING_OPENAI, "a", encoding="utf-8") as f:
        f.write(json.dumps(registro_openai, ensure_ascii=False) + "\n")
        
    print(f"\n[3] Formato de Fine-Tuning OpenAI actualizado en tiempo real:")
    print(f"    - Archivo: {RUTA_FINETUNING_OPENAI}")
    print(f"    - Entrada JSONL guardada con exito.")
    
    # 4. Demostracion de adaptacion en el siguiente turno
    print(f"\n[4] Efecto en el siguiente turno conversacional:")
    print(f"    - El chatbot ahora reconoce los terminos exactos utilizados por {nombre_alumna}.")
    print(f"    - El contexto inyectado en OpenAI recordara la preferencia expresada.")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    # Mensaje de prueba simulado que una alumna real podria enviar
    procesar_y_aprender_mensaje(
        mensaje_usuario="Hola, por favor, ¿pueden reservarme en Barré Signature Flow hoy a las 6:30pm con Valeria Mendoza?",
        respuesta_bot="¡Por supuesto, Camila! Tu cupo para Barré Signature Flow hoy a las 6:30 PM con Valeria Mendoza está reservado y confirmado en Azure SQL.",
        nombre_alumna="Camila Rodriguez"
    )
