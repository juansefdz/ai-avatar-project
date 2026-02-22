"use client";

import { useCallback, useRef, useState } from "react";
import StreamingAvatar, { AvatarQuality } from "@heygen/streaming-avatar";
import type { AvatarState, CallStatus } from "./types";

const INITIAL_STATE: AvatarState = {
  status: "idle",
  stream: null,
  error: null,
};

export function useStreamingAvatar() {
  const [state, setState] = useState<AvatarState>(INITIAL_STATE);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  const setStatus = (status: CallStatus, extra?: Partial<AvatarState>) =>
    setState((prev) => ({ ...prev, status, ...extra }));

  const handleCall = useCallback(async () => {
    setStatus("connecting", { stream: null, error: null });
    try {
      const avatarInstance = new StreamingAvatar({
        token: process.env.NEXT_PUBLIC_HEYGEN_TOKEN || "",
      });

      await avatarInstance.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "George_vines_public",
      });

      avatarRef.current = avatarInstance;
      setStatus("active", { stream: avatarInstance.mediaStream });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al conectar";
      console.error("Avatar connection error:", err);
      setStatus("error", { error: message });
    }
  }, []);

  const handleHangUp = useCallback(() => {
    try {
      avatarRef.current?.stopAvatar();
    } catch (_) {
      // ignore cleanup errors
    }
    avatarRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    handleCall,
    handleHangUp,
  };
}
