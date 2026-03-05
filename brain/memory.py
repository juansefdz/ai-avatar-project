import os
import time
import json
from typing import List

# Ruta persistente para la memoria
MEMORY_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "memory", "thoughts.log"))
os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)

class LearningMemory:
    def __init__(self):
        # Nos aseguramos de que el archivo exista
        if not os.path.exists(MEMORY_FILE):
            open(MEMORY_FILE, 'w').close()

    def memorize_interaction(self, user_input: str, agent_response: str) -> None:
        """Guarda la interacción en el archivo de logs."""
        interaction = {
            "timestamp": time.time(),
            "user": user_input,
            "ava": agent_response
        }
        with open(MEMORY_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(interaction) + "\n")
        print(f"[Memory] Interacción guardada en thoughts.log.")

    def recall_recent_and_relevant(self, current_input: str, max_lines: int = 5) -> List[str]:
        """Recupera el contexto más reciente del archivo thoughts.log."""
        try:
            with open(MEMORY_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            # Cogemos las últimas N interacciones
            recent_lines = lines[-max_lines:]
            
            context_list = []
            for line in recent_lines:
                if not line.strip():
                    continue
                data = json.loads(line)
                context_list.append(f"User: {data['user']}\nAVA: {data['ava']}")
                
            return context_list
        except Exception as e:
            print(f"[Memory Error] No se pudo leer thoughts.log: {e}")
            return []

# Instancia global (singleton) para ser importada
memory_store = LearningMemory()
