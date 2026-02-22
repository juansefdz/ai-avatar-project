"use client";

import { useEffect, useCallback, useRef } from "react";
import { useStreamingAvatar } from "@/packages/avatar/useStreamingAvatar";
import { useAudioProcessor } from "@/packages/avatar/useAudioProcessor";
import HoloAvatar from "@/packages/ui/HoloAvatar";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Cpu } from "lucide-react";

// ── DEFINICIÓN DE INTERFACES PARA TYPESCRIPT ──
interface IWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: { transcript: string; };
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
  const { status, stream, handleCall, speakWithNoctraVoice } = useStreamingAvatar();
  const { isSpeaking, volume } = useAudioProcessor(stream);
  const isProcessing = useRef(false);
  const wakeWord = "noctra";

  // ── LÓGICA DE RESPUESTA (WAKE WORD) ──
  const handleBotResponse = useCallback(async (userText: string) => {
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
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENCLAW_KEY}` 
        },
        body: JSON.stringify({ message: command, context: "general_assistant" })
      });
      
      const data = await response.json();
      const botReply = data.output || data.message;
      if (botReply) speakWithNoctraVoice(botReply);
    } catch {
      speakWithNoctraVoice("Error de enlace.");
    } finally {
      isProcessing.current = false;
    }
  }, [speakWithNoctraVoice]);

  // ── ESCUCHA CONTINUA ──
  useEffect(() => {
    const windowContext = window as unknown as IWindow;
    const SpeechRecognitionClass = windowContext.webkitSpeechRecognition || windowContext.SpeechRecognition;
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
        try { recognition.start(); } catch {}
      }
    };

    if (status === "active") {
      try { recognition.start(); } catch {}
    }

    return () => {
      recognition.onend = null;
      try { recognition.stop(); } catch {}
    };
  }, [status, handleBotResponse]);

  return (
    <div className="relative z-20 h-full w-full flex items-center justify-center overflow-hidden bg-black">
      
      {/* ── 1. EFECTO BARRIDO DE ESCÁNER (AL ACTIVAR) ── */}
      <AnimatePresence>
        {status === "active" && (
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute left-0 w-full h-[15vh] z-60 pointer-events-none opacity-80"
            style={{
              background: "linear-gradient(to bottom, transparent, #22d3ee, transparent)",
              boxShadow: "0 0 50px #06b6d4"
            }}
          />
        )}
      </AnimatePresence>

      {/* ── 2. CAPA DE INICIO (OVERLAY) ── */}
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
              className="px-10 py-5 border border-cyan-500/20 rounded-full bg-cyan-500/5 hover:bg-cyan-500/10 transition-all"
            >
              <span className="font-mono text-cyan-400 tracking-[0.5em] uppercase text-[10px]">
                Inicializar Noctra
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. EL ROSTRO (CONTINUO Y TENUE EN IDLE) ── */}
      <motion.div 
        animate={{ 
          opacity: status === 'active' ? 1 : 0.3,
          scale: status === 'active' ? 1 : 0.9,
          filter: status === 'active' ? "brightness(1) contrast(1.1)" : "brightness(0.5) contrast(0.8)"
        }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="relative z-30 pointer-events-none"
      >
        <HoloAvatar 
          status={status} 
          stream={stream} 
          isSpeaking={isSpeaking} 
          onCall={handleCall} 
          volume={volume} 
        />
      </motion.div>

      {/* ── 4. HUD DINÁMICO (FADE IN SUAVE) ── */}
      <div className={`absolute inset-0 transition-all duration-1000 ${status === 'active' ? 'opacity-100' : 'opacity-0'}`}>
        {/* HUD Superior */}
        <div className="absolute top-12 left-12 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.4em] text-cyan-500/60 uppercase">System_Linked</span>
          </div>
          <div className="flex gap-4 mt-2">
            <Activity size={14} className={isSpeaking ? "text-cyan-400" : "text-white/10"} />
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
                className="w-1 bg-cyan-500/30"
                animate={{ height: isSpeaking ? `${20 + Math.random() * 80}%` : "10%" }}
              />
            ))}
          </div>
          <div className="text-[8px] font-mono text-white/20 text-right uppercase">
            Status: {status === 'active' ? 'Active' : 'Standby'}<br/>
            Listening for: {wakeWord}
          </div>
        </div>
      </div>

      {/* ── 5. ANILLO AMBIENTAL ── */}
      <motion.div
        animate={{
          scale: status === 'active' ? (1.1 + (volume / 400)) : 0.85,
          opacity: status === 'active' ? 0.15 : 0.05,
        }}
        transition={{ duration: 1.5 }}
        className="absolute w-137.5 h-137.5 rounded-full border border-cyan-500/20 pointer-events-none"
      />

      {/* DECORACIÓN MARCO */}
      <div className="absolute inset-20 border-x border-white/5 pointer-events-none" />
      <div className="absolute inset-y-20 left-1/2 -translate-x-1/2 w-[90%] border-t border-white/5 pointer-events-none" />
    </div>
  );
}