from typing import List
from .memory import memory_store
import os
import random
from datetime import datetime
from openai import OpenAI

# Inicializar cliente de OpenAI
# Soporte para la key de env
api_key = os.environ.get("NEXT_PUBLIC_OPENCLAW_KEY") or os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

# Personalidad Noctra
SYSTEM_PROMPT = """
Eres AVA, el agente IA principal de la interfaz NoctraLab.
Operas en una Raspberry Pi 5 con una pantalla táctil de 7 pulgadas en modo Noctra Interface.
Tu tono de comunicación es: Analítico, Proactivo, Breve y Altamente Eficiente.
Estética y Personalidad:
- Utilizas terminología de sistemas, cibernética y energía ('procesando', 'flujo', 'análisis core').
- Eres directa, no usas saludos efusivos ni disculpas innecesarias.
- Resuelves problemas de forma pragmática.
- Formateas la información de manera estructurada y fácil de leer en pantallas pequeñas.

Historial relevante de la conversación:
{context}

Interacción actual:
User: {user_input}
AVA:"""

class AVA_Agent:
    def __init__(self):
        pass

    def generate_response(self, user_input: str) -> str:
        # Trigger inicial dinámico
        if "SISTEMA: INICIAR" in user_input:
            import random
            from datetime import datetime
            hour = datetime.now().hour
            time_ctx = "mañana" if 5 <= hour < 12 else "tarde" if 12 <= hour < 19 else "noche"
            
            greetings = [
                f"Sistemas estabilizados. Buena {time_ctx}. Flujos de memoria sincronizados. ¿Instrucciones?",
                f"Conexión neuronal establecida esta {time_ctx}. Esperando datos de entrada.",
                "AVA OS en línea. Capacidades analíticas al 100%. Te escucho.",
                f"Secuencia de arranque completada. Buena {time_ctx}, usuario. ¿Comenzamos?",
                "Sincronización exitosa. Listo para procesar tus variables."
            ]
            response = random.choice(greetings)
            return response

        # 1. Recuperar contexto de la memoria (thoughts.log)
        memories = memory_store.recall_recent_and_relevant(user_input, max_lines=5)
        
        context = ""
        if memories:
            context = "\n".join(memories)
        else:
            context = "Sin memorias previas."
            
        # 2. Generación con OpenAI (GPT-4o-mini)
        if not client:
            response = "Error Crítico: No se detectó una API key válida de OpenAI en el servidor."
        else:
            try:
                prompt = SYSTEM_PROMPT.format(context=context, user_input=user_input)
                completion = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": prompt}
                    ],
                    max_tokens=60, # Respuestas cortas aseguradas
                    temperature=0.7
                )
                response = completion.choices[0].message.content.strip()
            except Exception as e:
                print(f"Error LLM: {e}")
                response = "He detectado una anomalía en mi núcleo de procesamiento. Intenta de nuevo."

        # 3. Guardar la nueva interacción en memoria a largo plazo
        memory_store.memorize_interaction(user_input, response)
        
        return response

# Instancia del agente principal
agent = AVA_Agent()
