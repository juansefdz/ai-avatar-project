"use client";

import { useCallback, useEffect, useState } from "react";

// Tipos adaptados para el nuevo flujo de AVA (Noctra)
export type OpenClawStatus = "disconnected" | "ready" | "thinking" | "error";

export interface OpenClawMessage {
  role: "user" | "agent";
  text: string;
  ts: number;
}

interface OpenClawState {
  status: OpenClawStatus;
  messages: OpenClawMessage[];
  lastReply: string | null;
  error: string | null;
}

const INITIAL_STATE: OpenClawState = {
  status: "disconnected",
  messages: [],
  lastReply: null,
  error: null,
};

// URL del servicio Python (Brain) en la Raspberry Pi
const BRAIN_API_URL =
  process.env.NEXT_PUBLIC_BRAIN_API_URL ?? "http://127.0.0.1:8000";

/**
 * useOpenClaw (AVA Edition)
 * * Versión optimizada para Raspberry Pi 5.
 * Se conecta al servicio 'Brain' en Python que maneja Antigravity.
 */
export function useOpenClaw() {
  const [state, setState] = useState<OpenClawState>(INITIAL_STATE);

  // ── Conexión / Inicialización ─────────────────────
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "ready", error: null }));
    console.log("AVA Brain conectado en:", BRAIN_API_URL);
  }, []);

  const disconnect = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // ── Envío de Mensajes (El Corazón de la IA) ────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 1. Agregar mensaje del usuario a la UI
    const userMsg: OpenClawMessage = { role: "user", text, ts: Date.now() };

    setState((prev) => ({
      ...prev,
      status: "thinking",
      messages: [...prev.messages, userMsg],
      lastReply: null,
    }));

    try {
      // 2. Petición al "Cerebro" (Antigravity/Python)
      // Este endpoint guarda el pensamiento y genera la respuesta
      const response = await fetch(`${BRAIN_API_URL}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del Cerebro");

      const data = await response.json();

      // 3. Actualizar estado con la respuesta del agente
      const agentMsg: OpenClawMessage = {
        role: "agent",
        text: data.response,
        ts: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        status: "ready",
        messages: [...prev.messages, agentMsg],
        lastReply: data.response,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Error desconocido",
      }));
    }
  }, []);

  // Auto-activación al montar
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
  };
}
