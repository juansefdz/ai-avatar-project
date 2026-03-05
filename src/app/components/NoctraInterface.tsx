"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useStreamingAvatar } from "@/packages/avatar/useStreamingAvatar";
import { useAudioProcessor } from "@/packages/avatar/useAudioProcessor";
import { useOpenClaw } from "@/packages/avatar/useOpenClaw";
import OpenClawHeart from "@/packages/ui/OpenClawHeart";
import { VoiceWave } from "@/packages/ui/VoiceWave";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Cpu,
  Cloud,
  Mic,
  Volume2,
  MicOff,
  Power,
  VolumeX,
  Server,
} from "lucide-react";

// ── DEFINICIÓN DE INTERFACES PARA TYPESCRIPT ──
interface IWindow extends Window {
  SpeechRecognition: unknown;
  webkitSpeechRecognition: unknown;
}

export default function NoctraInterface() {
  const [clientIp, setClientIp] = useState("190.255.133.23");
  const [currentTime, setCurrentTime] = useState(new Date());

  // HUD Telemetry
  const [metrics, setMetrics] = useState({ cpu: 0, ram: 0, temp: 0 });

  // Estados interactivos para el hardware (Mute/Unmute manual)
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const {
    status: avatarStatus,
    stream,
    handleCall,
    handleHangUp,
    speakWithNoctraVoice,
  } = useStreamingAvatar();
  const { status: clawStatus, sendMessage, lastReply } = useOpenClaw();
  const { isSpeaking, volume, frequencies } = useAudioProcessor(stream);
  const isProcessing = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Control del Reconocimiento de Voz (Web Speech API Falso - Backup para Wake Word si se desea a futuro)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Estado derivado auditivo: "isListening" (Bot escuchando al cliente)
  const isListening = avatarStatus === "active" && !isSpeaking && !isMicMuted;

  // 1. Mostrar Tiempo y Fetch de IP Local Verdadera (LAN)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // El método más seguro y certero sin apis externas es leer el Host local actual
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const hostname = window.location.hostname;
        // Si estamos en localhost directo la mostramos, sino la IP real (192.x) que se usó para acceder
        setClientIp(hostname === "localhost" ? "127.0.0.1" : hostname);
      }, 0);
    }

    return () => clearInterval(timer);
  }, []);

  // 1.5 Polling de Telemetría (Carga de HW local) a FastAPI /metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const brainUrl =
          process.env.NEXT_PUBLIC_BRAIN_API_URL || "http://localhost:8000";
        const res = await fetch(`${brainUrl}/metrics`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch {
        // Fallo silente
      }
    };

    // Polling cada 3 segundos para dar sensación de "viva" a la UI
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Función para procesar y enviar respuesta al Cerebro (Brain API)
  const handleBotResponse = useCallback(
    (userText: string) => {
      if (isProcessing.current || clawStatus === "thinking") return;
      isProcessing.current = true;

      // Usar el hook useOpenClaw que apunta a nuestro backend en Python (FastAPI `/process`)
      sendMessage(userText).finally(() => {
        isProcessing.current = false;
      });
    },
    [sendMessage, clawStatus],
  );

  // 2.5 Grabación de Audio Directa y Procesamiento con Whisper
  const processWhisperAudio = async (blob: Blob) => {
    if (isProcessing.current || clawStatus === "thinking") return;
    isProcessing.current = true;
    try {
      const apiKey =
        process.env.NEXT_PUBLIC_OPENCLAW_KEY ||
        process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) throw new Error("API Key Faltante");

      // Usar FormData para enviar el archivo binario nativo al endpoint de Whisper
      const formData = new FormData();
      formData.append("file", blob, "voice.webm");
      formData.append("model", "whisper-1");
      formData.append("language", "es"); // Hardcodeado a Español (Kiosk Context)

      const res = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Fallo en la transcripción de Whisper");
      const data = await res.json();

      console.log("[Whisper Transcrito]:", data.text);
      if (data.text && data.text.trim().length > 0) {
        handleBotResponse(data.text);
      }
    } catch (e) {
      console.error(e);
      isProcessing.current = false;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await processWhisperAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accediendo al micrófono Kiosk:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Escuchar cuando el Cerebro responde para hablar el texto
  useEffect(() => {
    if (lastReply) {
      speakWithNoctraVoice(lastReply);
    }
  }, [lastReply, speakWithNoctraVoice]);

  // 3. Cargar Saludo Inicial Dinámico
  useEffect(() => {
    if (avatarStatus === "active") {
      sendMessage("SISTEMA: INICIAR Y SALUDAR");
    }
  }, [avatarStatus, sendMessage]);

  // 4. Inicializar y manejar la escucha con la palabra de activación (wake word)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const { SpeechRecognition, webkitSpeechRecognition } =
        window as unknown as IWindow;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechReco = (SpeechRecognition || webkitSpeechRecognition) as any;

      if (SpeechReco && avatarStatus === "active") {
        const recognition = new SpeechReco();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "es-ES";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          if (isMicMuted) return;

          const transcript =
            event.results[event.results.length - 1][0].transcript.toLowerCase();

          // Compatibilidad legacy de Wake-Word
          if (transcript.includes("noctra") && !isProcessing.current) {
            handleBotResponse(transcript);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error("Error SpeechRecognition:", event.error);
        };

        recognition.onend = () => {
          if (avatarStatus === "active") {
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
  }, [avatarStatus, isMicMuted, handleBotResponse]);

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
        {/* Valores estáticos dispersos en toda la pantalla en lugar de Math.random para arreglar lints impuros */}
        {[
          { l: 15, t: 25, s: 1.2, d: 2 },
          { l: 75, t: 10, s: 0.8, d: 5 },
          { l: 45, t: 65, s: 1.5, d: 1 },
          { l: 20, t: 80, s: 0.9, d: 4 },
          { l: 85, t: 45, s: 1.1, d: 3 },
          { l: 60, t: 30, s: 1.4, d: 6 },
          { l: 10, t: 55, s: 0.7, d: 2.5 },
          { l: 70, t: 85, s: 1.0, d: 4.5 },
          { l: 30, t: 35, s: 1.3, d: 1.5 },
          { l: 90, t: 95, s: 0.8, d: 5.5 },
          { l: 50, t: 15, s: 1.6, d: 3.5 },
          { l: 5, t: 90, s: 0.9, d: 0.5 },
        ].map((particle, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-cyan-400 blur-[1px]"
            initial={{
              left: `${particle.l}%`,
              top: `${particle.t}%`,
              opacity: 0.1,
              scale: particle.s,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 10 + particle.d,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.d,
            }}
            style={{ width: 3, height: 3 }}
          />
        ))}
      </div>

      {/* ── 2. ONDAS DE SONIDO ── */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <VoiceWave
          volume={volume}
          frequencies={frequencies}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* ── 3. ORBE CENTRAL ── */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
        <OpenClawHeart />
      </div>

      {/* ── 4. CAPA DE INICIO (OVERLAY) ── */}
      <AnimatePresence>
        {avatarStatus === "idle" && (
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
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Mic Suspended
                </span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <VolumeX size={24} className="text-slate-300" />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Audio Suspended
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. HUD DINÁMICO (GLASSMORPHISM) ── */}
      <AnimatePresence>
        {avatarStatus === "active" && (
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
                    <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                      System
                    </span>
                    <span className="text-sm font-semibold text-cyan-50 tracking-wide">
                      NOCTRA AI
                    </span>
                  </div>

                  <div className="w-px h-8 bg-white/10 mx-1" />

                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                      Local Network
                    </span>
                    <span className="text-sm font-mono text-cyan-100">
                      {clientIp}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-2xl border backdrop-blur-xl transition-all shadow-lg flex items-center justify-center ${isMicMuted ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                  >
                    {isMicMuted ? (
                      <MicOff size={18} className="text-red-400" />
                    ) : (
                      <Mic
                        size={18}
                        className={
                          isListening
                            ? "text-cyan-400 animate-pulse"
                            : "text-slate-400"
                        }
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                    className={`p-3 rounded-2xl border backdrop-blur-xl transition-all shadow-lg flex items-center justify-center ${isSpeakerMuted ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                  >
                    {isSpeakerMuted ? (
                      <VolumeX size={18} className="text-red-400" />
                    ) : (
                      <Volume2
                        size={18}
                        className={
                          isSpeaking
                            ? "text-blue-400 animate-bounce"
                            : "text-slate-400"
                        }
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Top Right: System Metrics */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl py-3 px-5 flex items-center gap-6 shadow-2xl">
                <div className="flex flex-col items-center gap-1">
                  <Cpu size={16} className="text-cyan-400" />
                  <span className="text-[10px] font-mono text-cyan-200">
                    {metrics.cpu.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Server size={16} className="text-blue-400" />
                  <span className="text-[10px] font-mono text-blue-200">
                    {metrics.ram.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Shield size={16} className="text-teal-400" />
                  <span className="text-[10px] font-mono text-teal-200 tracking-wider">
                    OK
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Area */}
            <div className="flex justify-between items-end w-full">
              {/* Bottom Left: Time & Weather */}
              <div className="flex gap-4">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-center min-w-40">
                  <span className="text-5xl font-light tracking-tighter text-white mb-1">
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase">
                    {currentTime.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-center min-w-35">
                  <span className="text-4xl font-light tracking-tighter text-white mb-1">
                    {metrics.temp > 0 ? `${metrics.temp.toFixed(1)}°C` : "24°C"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase flex items-center gap-2">
                    <Cloud size={14} /> Local HW
                  </span>
                </div>
              </div>

              {/* Bottom Middle: Push to Talk */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-auto mb-8">
                <button
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                  className={`px-8 py-4 rounded-full font-mono text-sm uppercase tracking-[0.2em] transition-all shadow-2xl backdrop-blur-xl border ${
                    isRecording
                      ? "bg-red-500/20 border-red-500 text-red-200 animate-pulse scale-95 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                      : clawStatus === "thinking"
                        ? "bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]/50 cursor-not-allowed"
                        : "bg-white/5 border-[#00f2ff]/30 hover:bg-white/10 text-[#00f2ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                  }`}
                >
                  {isRecording
                    ? "ESCuchando..."
                    : clawStatus === "thinking"
                      ? "Procesando..."
                      : "MANTENER PARA HABLAR"}
                </button>
              </div>

              {/* Bottom Right: Status & Suspend */}
              <div className="flex flex-col items-end gap-3 pointer-events-auto">
                <div className="text-[10px] text-slate-300/60 font-mono text-right uppercase font-semibold tracking-widest pointer-events-none mb-1">
                  Status: {avatarStatus === "active" ? "Active" : "Standby"}
                  <br />
                  Wake-Word: NOCTRA
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
