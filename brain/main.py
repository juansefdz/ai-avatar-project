from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agent import agent

app = FastAPI(title="AVA Brain Layer API", description=" Orquestation endpoint for Noctra Interface")

# Permitir a Next.js consumir la API localmente
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestMessage(BaseModel):
    message: str

class ResponseMessage(BaseModel):
    response: str

@app.get("/health")
def health_check():
    return {"status": "AVA Core Operating at 100%"}

@app.post("/process", response_model=ResponseMessage)
def process_message(req: RequestMessage):
    if not req.message:
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío.")
    
    try:
        reply = agent.generate_response(req.message)
        return ResponseMessage(response=reply)
        
    except Exception as e:
        print(f"[Error AVA Core]: {e}")
        raise HTTPException(status_code=500, detail="Fallo en la matriz cognitiva de AVA.")

import psutil

@app.get("/metrics")
def get_metrics():
    # CPU y RAM
    cpu_percent = psutil.cpu_percent(interval=0.1)
    ram_info = psutil.virtual_memory()
    
    # Intento seguro de obtener temperatura (varía fuertemente por OS linux/mac)
    temp = 0.0
    try:
        if hasattr(psutil, "sensors_temperatures"):
            temps = psutil.sensors_temperatures()
            if temps:
                # La raspberry expone 'cpu_thermal'
                for name, entries in temps.items():
                    if entries:
                        temp = entries[0].current
                        break
    except Exception:
        pass
        
    return {
        "cpu": cpu_percent,
        "ram": ram_info.percent,
        "temp": temp
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)