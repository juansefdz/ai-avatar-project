"use client";

import { useCallback, useState, useEffect } from "react";
import type { AvatarState, CallStatus } from "./types";

const INITIAL_STATE: AvatarState = {
  status: "idle",
  stream: null,
  error: null,
};

export function useStreamingAvatar() {
  const [state, setState] = useState<AvatarState>(INITIAL_STATE);

  // ── FUNCIÓN DE HABLA GENERAL ──
  const speakWithNoctraVoice = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis
      .getVoices()
      .filter((v) => v.lang.startsWith("es"));

    // Prioridad a voces femeninas premium y naturales (Solo en Español)
    const noctraVoice =
      voices.find((v) => v.name.includes("Monica")) ||
      voices.find((v) => v.name.includes("Paulina")) ||
      voices.find(
        (v) => v.name.includes("Google") && v.name.includes("Femenino"),
      ) ||
      voices.find((v) => v.name.includes("Helena")) ||
      voices.find(
        (v) =>
          v.name.includes("Female") ||
          v.name.includes("femenino") ||
          v.name.includes("Femenina"),
      ) ||
      voices[0]; // Fallback a la primera voz en español disponible

    if (noctraVoice) {
      utterance.voice = noctraVoice;
    }

    utterance.lang = "es-ES";
    utterance.rate = 1.1; // Más ágil y moderna, sin distorsión
    utterance.pitch = 1.05; // Tono femenino natural, no chillón

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── SALUDOS GENÉRICOS ALEATORIOS ──
  useEffect(() => {
    if (state.status === "active") {
      const loadAndSpeak = () => {
        setTimeout(() => {
          const greetings = [
            "Hola, ¿en qué puedo ayudarte hoy?",
            "Sistemas listos. ¿Qué tienes en mente?",
            "Hola, soy Noctra. Estoy lista para lo que necesites.",
            "Conexión establecida. ¿En qué vamos a trabajar?",
            "Hola. ¿Hay algo en lo que pueda apoyarte ahora?",
          ];

          const randomGreeting =
            greetings[Math.floor(Math.random() * greetings.length)];
          speakWithNoctraVoice(randomGreeting);
        }, 1000);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = loadAndSpeak;
      } else {
        loadAndSpeak();
      }
    }
  }, [state.status, speakWithNoctraVoice]);

  // ── MANEJADORES DE ESTADO ──
  const handleCall = useCallback(() => {
    setState((prev) => ({ ...prev, status: "active" as CallStatus }));
  }, []);

  const handleHangUp = useCallback(() => {
    window.speechSynthesis.cancel();
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    handleCall,
    handleHangUp,
    speakWithNoctraVoice,
  };
}
