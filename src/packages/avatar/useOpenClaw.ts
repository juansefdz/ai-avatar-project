"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type OpenClawStatus = "disconnected" | "connecting" | "ready" | "thinking" | "error";

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

const GATEWAY_URL = process.env.NEXT_PUBLIC_OPENCLAW_WS_URL ?? "ws://127.0.0.1:18789/";
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_OPENCLAW_TOKEN ?? "";

// ── Helpers ──────────────────────────────────────────
function uuid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * useOpenClaw
 *
 * Connects to the local OpenClaw Gateway via WebSocket.
 * Config: set NEXT_PUBLIC_OPENCLAW_TOKEN=<your_token> in .env.local
 *
 * Flow:
 *  1. WS open → receive connect.challenge event (or skip straight to connect req)
 *  2. Send connect req with operator scope + auth token
 *  3. Wait for hello-ok → status becomes "ready"
 *  4. sendMessage() sends a chat.send req → watch for "agent" events with reply text
 *  5. Emits lastReply each time the agent finishes a response
 */
export function useOpenClaw() {
  const [state, setState] = useState<OpenClawState>(INITIAL_STATE);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<Map<string, (payload: unknown) => void>>(new Map());

  const setStatus = (status: OpenClawStatus, extra?: Partial<OpenClawState>) =>
    setState((prev) => ({ ...prev, status, ...extra }));

  // ── Connect ──────────────────────────────────────
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting", { error: null });

    const ws = new WebSocket(GATEWAY_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send connect handshake immediately
      const id = uuid();
      ws.send(
        JSON.stringify({
          type: "req",
          id,
          method: "connect",
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: "ai-avatar-ui",
              version: "1.0.0",
              platform: "web",
              mode: "operator",
            },
            role: "operator",
            scopes: ["operator.read", "operator.write"],
            caps: [],
            commands: [],
            permissions: {},
            auth: { token: GATEWAY_TOKEN },
            locale: "es",
            userAgent: "ai-avatar-ui/1.0.0",
          },
        })
      );

      // Register cb for hello-ok
      pendingRef.current.set(id, () => {
        setStatus("ready");
      });
    };

    ws.onmessage = (evt) => {
      try {
        const frame = JSON.parse(evt.data as string);

        // ── Response to a pending request ──────────
        if (frame.type === "res") {
          const cb = pendingRef.current.get(frame.id);
          if (cb) {
            pendingRef.current.delete(frame.id);
            if (frame.ok) {
              cb(frame.payload);
            } else {
              setStatus("error", { error: frame.error?.message ?? "Unknown error" });
            }
          }
          return;
        }

        // ── Server events ──────────────────────────
        if (frame.type === "event") {
          const { event, payload } = frame as { event: string; payload: Record<string, unknown> };

          // Agent streaming reply — accumulate text chunks
          if (event === "agent") {
            const chunk = (payload?.text as string) ?? "";
            if (chunk) {
              setStatus("thinking", {});
              setState((prev) => {
                const msgs = [...prev.messages];
                // Append to last agent message if it's still streaming, else push new
                const last = msgs[msgs.length - 1];
                if (last?.role === "agent" && !last.text.endsWith("…END")) {
                  msgs[msgs.length - 1] = { ...last, text: last.text + chunk };
                } else {
                  msgs.push({ role: "agent", text: chunk, ts: Date.now() });
                }
                return { ...prev, status: "thinking", messages: msgs };
              });
            }

            // End of agent turn
            if (payload?.status === "ok" || payload?.done === true) {
              setState((prev) => {
                const lastAgent = [...prev.messages]
                  .reverse()
                  .find((m) => m.role === "agent");
                return {
                  ...prev,
                  status: "ready",
                  lastReply: lastAgent?.text ?? null,
                };
              });
            }
          }

          // Connect challenge (some versions send this first)
          if (event === "connect.challenge") {
            // Re-trigger the connect — already handled in onopen
            // No-op here since we always send connect on open
          }
        }
      } catch {
        // Ignore malformed frames
      }
    };

    ws.onerror = () => setStatus("error", { error: "WebSocket connection failed" });
    ws.onclose = () =>
      setState((prev) =>
        prev.status !== "error" ? { ...prev, status: "disconnected" } : prev
      );
  }, []);

  // ── Disconnect ───────────────────────────────────
  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  // ── Send message ─────────────────────────────────
  const sendMessage = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const userMsg: OpenClawMessage = { role: "user", text, ts: Date.now() };
    setState((prev) => ({
      ...prev,
      status: "thinking",
      messages: [...prev.messages, userMsg],
      lastReply: null,
    }));

    const id = uuid();
    ws.send(
      JSON.stringify({
        type: "req",
        id,
        method: "chat.send",
        params: { text, channel: "ui" },
      })
    );
  }, []);

  // Auto-connect on mount — deferred to avoid setState inside effect body
  useEffect(() => {
    const t = setTimeout(() => connect(), 0);
    return () => {
      clearTimeout(t);
      wsRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
  };
}
