"use client";

import { useCallback, useState } from "react";
import type { AvatarState, CallStatus } from "./types";

const INITIAL_STATE: AvatarState = {
  status: "idle",
  stream: null,
  error: null,
};

export function useStreamingAvatar() {
  const [state, setState] = useState<AvatarState>(INITIAL_STATE);

  // ── FUNCIÓN DE HABLA GENERAL (Voz Hiper-realista) ──
  const speakWithNoctraVoice = useCallback(async (text: string) => {
    // Interrumpimos cualquier habla anterior nativa
    window.speechSynthesis.cancel();

    try {
      const apiKey =
        process.env.NEXT_PUBLIC_OPENCLAW_KEY ||
        process.env.NEXT_PUBLIC_OPENAI_API_KEY;

      if (!apiKey) {
        console.warn("Sin API Key de OpenAI. Usando voz robótica de respaldo.");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "es-ES";
        utterance.pitch = 1.1; // Tono ligeramente más alto
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Solicitud al modelo TTS-1 de OpenAI
      // 'nova' es una voz femenina, sutil, suave y muy natural.
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "nova",
        }),
      });

      if (!res.ok) throw new Error("Fallo en la síntesis de OpenAI TTS");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      // Capturar stream para las ondas visuales (Compatible con Chromium/Chrome Kiosk)
      interface AudioWithCapture extends HTMLAudioElement {
        captureStream?: () => MediaStream;
        mozCaptureStream?: () => MediaStream;
      }

      const captureElement = audio as AudioWithCapture;
      const captureStream =
        captureElement.captureStream || captureElement.mozCaptureStream;
      if (captureStream) {
        const stream = captureStream.call(audio);
        setState((prev) => ({ ...prev, stream }));
      }

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setState((prev) => ({ ...prev, stream: null }));
      };

      await audio.play();
    } catch (error) {
      console.error("Error al sintetizar voz hiper-realista:", error);
    }
  }, []);

  // ── SALUDOS GENÉRICOS ALEATORIOS ELIMINADOS ──
  // Ahora el Brain API (FastAPI) proveerá las respuestas iniciales de forma dinámica

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
