"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useStreamingAvatar } from "@/packages/avatar/useStreamingAvatar";
import { useAudioProcessor } from "@/packages/avatar/useAudioProcessor";
import OpenClawHeart from "@/packages/ui/OpenClawHeart";
import VoiceWave from "@/packages/ui/VoiceWave";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cpu, Cloud, Mic, Volume2, MicOff, Power, VolumeX, Server } from "lucide-react";

// ── DEFINICIÓN DE INTERFACES PARA TYPESCRIPT ──
interface IWindow extends Window {
  SpeechRecognition: unknown;
  webkitSpeechRecognition: unknown;
}

export default function NoctraInterface() {
  const [clientIp, setClientIp] = useState("190.255.133.23");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estados interactivos para el hardware (Mute/Unmute manual)
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  
  const { status, stream, handleCall, handleHangUp, speakWithNoctraVoice } =
    useStreamingAvatar();
  const { isSpeaking, volume, frequencies } = useAudioProcessor(stream);
  const isProcessing = useRef(false);
  const wakeWord = "noctra";

  // Control del Reconocimiento de Voz (Web Speech API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Estado derivado auditivo: "isListening" (Bot escuchando al cliente)
  const isListening = status === "active" && !isSpeaking && !isMicMuted;

  // 1. Mostrar Tiempo y Fetch de IP Local
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Obtenemos la IP desde la API local del cliente
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setClientIp(data.ip))
      .catch(() => setClientIp("190.255.133.23"));

    return () => clearInterval(timer);
  }, []);

  // 2. Función para procesar y enviar respuesta al LLM (Botón/Interacción)
  const handleBotResponse = useCallback(async (userText: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      const completionReq = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENCLAW_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Eres Noctra, una IA avanzada y sarcástica. Responde en 1-2 oraciones cortas en español.",
            },
            {
              role: "user",
              content: userText,
            },
          ],
        }),
      });

      const responseData = await completionReq.json();
      if (responseData.choices && responseData.choices[0].message) {
        const aiAudioText = responseData.choices[0].message.content;
        await speakWithNoctraVoice(aiAudioText);
      }
    } catch (error) {
      console.error("Error al procesar la respuesta de la IA:", error);
    } finally {
      isProcessing.current = false;
    }
  }, [speakWithNoctraVoice]);

  // 3. Inicializar y manejar la escucha con la palabra de activación (wake word)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechReco = (SpeechRecognition || webkitSpeechRecognition) as any;

      if (SpeechReco && status === "active") {
        const recognition = new SpeechReco();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "es-ES";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          if (isMicMuted) return; // No procesar si el micrófono está muteado
          
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
          console.log("Detectado:", transcript);

          if (transcript.includes(wakeWord.toLowerCase()) && !isProcessing.current) {
            handleBotResponse(transcript);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error("Error SpeechRecognition:", event.error);
        };

        recognition.onend = () => {
          if (status === "active") {
            try {
              recognition.start();
            } catch {
              console.log("El reconocimiento ya se reinició.");
            }
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch {
          console.log("No se pudo iniciar el reconocimiento de voz.");
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [status, isMicMuted, handleBotResponse]);

  return (
    <div className="relative z-20 h-full w-full flex items-center justify-center overflow-hidden bg-[#000000] text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* ── 0. FONDO AMBIENTAL (PROFUNDIDAD EXTREMA) ── */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.6)_0%,rgba(0,0,0,1)_100%)]">
        {/* Luces perimetrales sutiles para enmarcar y hundir el centro */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.05),transparent_40%)]" />
      </div>

      {/* ── 1. PARTICULAS SUTILES ── */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-cyan-400 blur-[1px]"
            initial={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              opacity: 0.1, 
              scale: Math.random() * 1.5 + 0.5
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
            style={{ width: 3, height: 3 }}
          />
        ))}
      </div>

      {/* ── 2. ONDAS DE SONIDO ── */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
         <VoiceWave volume={volume} frequencies={frequencies} isSpeaking={isSpeaking} />
      </div>

      {/* ── 3. ORBE CENTRAL ── */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
         <OpenClawHeart />
      </div>

      {/* ── 4. CAPA DE INICIO (OVERLAY) ── */}
      <AnimatePresence>
        {status === "idle" && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCall}
              className="px-12 py-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-medium tracking-widest text-sm uppercase shadow-[0_10px_40px_rgba(6,182,212,0.3)] transition-all"
            >
              START SYSTEM
            </motion.button>
            
            <div className="flex gap-12 mt-10 opacity-70">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <MicOff size={24} className="text-slate-300" />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Mic Suspended</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <VolumeX size={24} className="text-slate-300" />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Audio Suspended</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. HUD DINÁMICO (GLASSMORPHISM) ── */}
      <AnimatePresence>
        {status === "active" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-40 pointer-events-none p-8 flex flex-col justify-between"
          >
            {/* Top Area */}
            <div className="flex justify-between items-start w-full">
              {/* Top Left: Server Info & Hardware Toggles */}
              <div className="flex flex-col gap-4">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl py-3 px-5 flex items-center gap-5 shadow-2xl">
                  {/* Status Dot */}
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">System</span>
                    <span className="text-sm font-semibold text-cyan-50 tracking-wide">NOCTRA AI</span>
                  </div>
                  
                  <div className="w-px h-8 bg-white/10 mx-1" />
                  
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Local Network</span>
                    <span className="text-sm font-mono text-cyan-100">{clientIp}</span>
                  </div>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                  <button 
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-2xl border backdrop-blur-xl transition-all shadow-lg flex items-center justify-center ${isMicMuted ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    {isMicMuted ? <MicOff size={18} className="text-red-400" /> : <Mic size={18} className={isListening ? "text-cyan-400 animate-pulse" : "text-slate-400"} />}
                  </button>
                  <button 
                    onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                    className={`p-3 rounded-2xl border backdrop-blur-xl transition-all shadow-lg flex items-center justify-center ${isSpeakerMuted ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    {isSpeakerMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className={isSpeaking ? "text-blue-400 animate-bounce" : "text-slate-400"} />}
                  </button>
                </div>
              </div>

              {/* Top Right: System Metrics */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl py-3 px-5 flex items-center gap-6 shadow-2xl">
                 <Cpu size={20} className="text-cyan-400" />
                 <Server size={20} className="text-blue-400" />
                 <Shield size={20} className="text-teal-400" />
              </div>
            </div>

            {/* Bottom Area */}
            <div className="flex justify-between items-end w-full">
              {/* Bottom Left: Time & Weather */}
              <div className="flex gap-4">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-center min-w-40">
                   <span className="text-5xl font-light tracking-tighter text-white mb-1">
                     {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                   </span>
                   <span className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase">
                     {currentTime.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                   </span>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-center min-w-35">
                   <span className="text-4xl font-light tracking-tighter text-white mb-1">24°C</span>
                   <span className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase flex items-center gap-2">
                     <Cloud size={14}/> Medellín
                   </span>
                </div>
              </div>

              {/* Bottom Right: Status & Suspend */}
              <div className="flex flex-col items-end gap-3 pointer-events-auto">
                 <div className="text-[10px] text-slate-300/60 font-mono text-right uppercase font-semibold tracking-widest pointer-events-none mb-1">
                    Status: {status === "active" ? "Active" : "Standby"}
                    <br />
                    Listening: {wakeWord}
                 </div>
                 <button 
                    onClick={handleHangUp}
                    className="flex items-center gap-3 backdrop-blur-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-100 px-6 py-4 rounded-3xl transition-all shadow-2xl font-semibold tracking-widest text-xs uppercase"
                 >
                    <Power size={16} />
                    SUSPEND
                 </button>
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
