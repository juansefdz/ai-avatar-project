"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useStreamingAvatar } from "@/packages/avatar/useStreamingAvatar";
import { useAudioProcessor } from "@/packages/avatar/useAudioProcessor";
import VoiceWave from "@/packages/ui/VoiceWave";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Cpu, Clock, Cloud } from "lucide-react";

// ── DEFINICIÓN DE INTERFACES PARA TYPESCRIPT ──
interface IWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function NoctraInterface() {
  const { status, stream, handleCall, speakWithNoctraVoice } =
    useStreamingAvatar();
  const { isSpeaking, volume, frequencies } = useAudioProcessor(stream);
  const isProcessing = useRef(false);
  const wakeWord = "noctra";

  // Estado para el reloj en tiempo real
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── LÓGICA DE RESPUESTA (WAKE WORD) ──
  const handleBotResponse = useCallback(
    async (userText: string) => {
      const normalizedText = userText.toLowerCase();
      if (!normalizedText.includes(wakeWord)) return;

      const command = normalizedText.replace(wakeWord, "").trim();
      if (isProcessing.current || command.length < 2) return;

      try {
        isProcessing.current = true;
        const response = await fetch("https://api.openclaw.ai/v1/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENCLAW_KEY}`,
          },
          body: JSON.stringify({
            message: command,
            context: "general_assistant",
          }),
        });

        const data = await response.json();
        const botReply = data.output || data.message;
        if (botReply) speakWithNoctraVoice(botReply);
      } catch {
        speakWithNoctraVoice("Error de enlace.");
      } finally {
        isProcessing.current = false;
      }
    },
    [speakWithNoctraVoice],
  );

  // ── ESCUCHA CONTINUA ──
  useEffect(() => {
    const windowContext = window as unknown as IWindow;
    const SpeechRecognitionClass =
      windowContext.webkitSpeechRecognition || windowContext.SpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition: SpeechRecognition = new SpeechRecognitionClass();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[event.results.length - 1][0].transcript;
      handleBotResponse(text);
    };

    recognition.onend = () => {
      if (status === "active") {
        try {
          recognition.start();
        } catch {}
      }
    };

    if (status === "active") {
      try {
        recognition.start();
      } catch {}
    }

    return () => {
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {}
    };
  }, [status, handleBotResponse]);

  return (
    <div className="relative z-20 h-full w-full flex items-center justify-center overflow-hidden bg-black text-white">
      {/* ── 1. EFECTO BARRIDO DE ESCÁNER ── */}
      <AnimatePresence>
        {status === "active" && (
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute left-0 w-full h-[15vh] z-60 pointer-events-none opacity-80"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #8B5CF6, transparent)",
              boxShadow: "0 0 50px 20px rgba(139, 92, 246, 0.3)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── 2. WIDGETS LATERALES (IZQUIERDA) ── */}
      <AnimatePresence>
        {status === "active" && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute left-16 z-40 flex flex-col gap-10 border-l border-violet-500/20 pl-6"
          >
            {/* Reloj */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-violet-500/40 mb-1">
                <Clock size={12} />
                <span className="text-[9px] font-mono tracking-widest uppercase">
                  System_Time
                </span>
              </div>
              <span className="text-4xl font-light font-mono tracking-tighter">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
              <span className="text-[9px] text-white/30 font-mono uppercase tracking-[0.2em] mt-1">
                {currentTime.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            {/* Clima */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-violet-500/40 mb-1">
                <Cloud size={12} />
                <span className="text-[9px] font-mono tracking-widest uppercase">
                  Medellin_Env
                </span>
              </div>
              <span className="text-3xl font-light font-mono tracking-tighter">
                24°C
              </span>
              <span className="text-[9px] text-white/30 font-mono uppercase tracking-[0.2em] mt-1">
                Nublado / 68% Hum.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. CAPA DE INICIO (OVERLAY) ── */}
      <AnimatePresence>
        {status === "idle" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCall}
              className="px-10 py-5 border border-violet-500/20 rounded-full bg-linear-to-b from-violet-500/5 to-transparent hover:bg-violet-500/10 transition-all"
            >
              <span className="font-mono text-violet-400 tracking-[0.5em] uppercase text-[10px]">
                Inicializar Noctra
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. EL ROSTRO (DESPLAZAMIENTO A LA DERECHA) ── */}
      <motion.div
        animate={{
          opacity: status === "active" ? 1 : 0.3,
          scale: status === "active" ? 1 : 0.8,
          x: 0, // Centrado para las ondas
          filter:
            status === "active"
              ? "brightness(1.2) contrast(1.1)"
              : "brightness(0.5) contrast(0.8)",
        }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="relative z-30 pointer-events-none"
      >
        <VoiceWave
          volume={volume}
          frequencies={frequencies}
          isSpeaking={isSpeaking}
        />
      </motion.div>

      {/* ── 5. HUD DINÁMICO ── */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${status === "active" ? "opacity-100" : "opacity-0"}`}
      >
        {/* HUD Superior */}
        <div className="absolute top-12 left-12 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.4em] text-violet-500/60 uppercase">
              Noctra_Online
            </span>
          </div>
          <div className="flex gap-4 mt-2">
            <Activity
              size={14}
              className={isSpeaking ? "text-violet-400" : "text-white/10"}
            />
            <Cpu size={14} className="text-white/10" />
            <Shield size={14} className="text-white/10" />
          </div>
        </div>

        {/* HUD Inferior */}
        <div className="absolute bottom-12 right-12 flex flex-col items-end gap-3">
          <div className="flex gap-1 h-12 items-end">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-violet-500/30"
                animate={{
                  height: isSpeaking ? `${20 + Math.random() * 80}%` : "10%",
                }}
              />
            ))}
          </div>
          <div className="text-[8px] font-mono text-white/20 text-right uppercase">
            Status: {status === "active" ? "Active" : "Standby"}
            <br />
            Listening: {wakeWord}
          </div>
        </div>
      </div>

      {/* ── 6. ANILLO AMBIENTAL ── */}
      <motion.div
        animate={{
          scale: status === "active" ? 1 + volume / 600 : 0.8,
          opacity: status === "active" ? 0.15 : 0.05,
          x: 0,
        }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="absolute w-[800px] h-[800px] rounded-full border border-violet-500/10 pointer-events-none"
      />

      {/* DECORACIÓN MARCO */}
      <div className="absolute inset-16 border border-white/3 pointer-events-none" />
    </div>
  );
}
