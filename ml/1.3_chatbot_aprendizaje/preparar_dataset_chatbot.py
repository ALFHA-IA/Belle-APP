"""
Modulo 1.3: Preparacion del Dataset de Entrenamiento y Aprendizaje Constante (Chatbot & Assistant)
Belle Barre Studio - Sistema Belle-APP
"""

import json
import os

def preparar_dataset_chatbot(ruta_salida="ml/1.3_chatbot_aprendizaje/dataset_chatbot.json"):
    intents = [
        {
            "intent": "consultar_reservas",
            "patrones": [
                "¿Qué clases tengo agendadas?",
                "Ver mis citas de hoy",
                "¿A qué hora es mi clase de Barre?",
                "¿Tengo reserva para hoy?",
                "¿Quién es mi instructora hoy?"
            ],
            "tool_asociada": "ConsultarReservasCliente",
            "respuesta_plantilla": "Tienes {total_clases} clase(s) agendada(s). Tu próxima sesión es {nombre_clase} a las {hora} con {instructor}."
        },
        {
            "intent": "agendar_clase",
            "patrones": [
                "Quiero reservar una clase",
                "Agendar Barre Fit Core a las 5pm",
                "Separa un cupo para mañana",
                "Quiero inscribirme a Barré Signature Flow",
                "¿Hay espacio disponible para hoy?"
            ],
            "tool_asociada": "CrearReservaClase",
            "respuesta_plantilla": "¡Genial! Tu reserva para {nombre_clase} el {fecha} a las {hora} ha sido confirmada con éxito."
        },
        {
            "intent": "consultar_precios_membresia",
            "patrones": [
                "¿Cuánto cuesta la membresía?",
                "¿Qué planes tienen disponibles?",
                "Precios de los paquetes de clases",
                "¿Tienen membresía ilimitada?",
                "¿Cuál es el valor del pase mensual?"
            ],
            "tool_asociada": "ConsultarPlanesStudio",
            "respuesta_plantilla": "Ofrecemos los siguientes planes en Belle Barre: 1) Pack 8 Clases (S/. 180), 2) Barré Unlimited (S/. 280/mes) y 3) Pase Libre Full (S/. 350)."
        },
        {
            "intent": "consultar_perfil_bes",
            "patrones": [
                "¿Cuál es mi racha de clases?",
                "¿Cuál es mi puntaje BES?",
                "¿Cuántas clases he tomado este mes?",
                "¿Cómo va mi compromiso en el estudio?",
                "Ver mi score de engagement"
            ],
            "tool_asociada": "ConsultarEngagementCliente",
            "respuesta_plantilla": "¡Tu compromiso es increible! Tienes un Belle Engagement Score (BES) de {bes} puntos y una racha activa de {racha} semanas."
        },
        {
            "intent": "analisis_postural_vision",
            "patrones": [
                "¿Cómo estuvo mi postura en la clase?",
                "Quiero revisar mi alineación de hombros",
                "¿Tengo alguna desalineación en caderas?",
                "Analizar mi postura de hoy",
                "Ver feedback de Belle Vision"
            ],
            "tool_asociada": "ConsultarUltimoAnalisisVision",
            "respuesta_plantilla": "Según tu último análisis de Belle Vision, tu simetría es de {simetria}% con alineación postural óptima. Recomendación: {recomendacion}."
        }
    ]
    
    os.makedirs(os.path.dirname(os.path.abspath(ruta_salida)), exist_ok=True)
    with open(ruta_salida, "w", encoding="utf-8") as f:
        json.dump(intents, f, indent=2, ensure_ascii=False)
        
    print(f"[OK] Dataset de Chatbot & Aprendizaje Constante preparado: {len(intents)} intents.")
    return ruta_salida

if __name__ == "__main__":
    preparar_dataset_chatbot()
