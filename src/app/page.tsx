"use client";

import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  TaskType,
} from "@heygen/streaming-avatar";
import { Mic, PhoneOff, Zap, ShieldCheck, Activity, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FuturisticCall() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Inicializar y conectar automáticamente al llamar
  const handleCall = async () => {
    setIsCalling(true);
    try {
      const avatarInstance = new StreamingAvatar({
        token: process.env.NEXT_PUBLIC_HEYGEN_TOKEN || "",
      });

      await avatarInstance.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "George_vines_public",
      });

      setAvatar(avatarInstance);
      setStream(avatarInstance.mediaStream);
    } catch (err) {
      console.error("Link Error:", err);
      setIsCalling(false);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <main className="min-h-screen bg-[#020205] flex items-center justify-center p-6 font-mono overflow-hidden">
      {/* Fondo con Grid Dinámico */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151515_1px,transparent_1px),linear-gradient(to_bottom,#151515_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
        {/* Decoración HUD Izquierda */}
        <div className="absolute left-0 top-1/4 space-y-8 hidden lg:block text-cyan-500/50">
          <div className="flex items-center gap-4">
            <Activity size={18} className="animate-pulse" />
            <div className="h-[2px] w-24 bg-cyan-900/50" />
            <span className="text-[10px] tracking-tighter">
              BIO-SYNC: ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Globe size={18} />
            <div className="h-[2px] w-16 bg-cyan-900/50" />
            <span className="text-[10px] tracking-tighter">NODE: EN-01</span>
          </div>
        </div>

        {/* CONTENEDOR DE LA AGENTE (Holograma) */}
        <div className="relative group">
          {/* Brillo Exterior */}
          <div className="absolute -inset-1 bg-cyan-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-2 border-cyan-500/30 bg-black shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            {/* Efecto de Interferencia (Scanlines) */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            {!isCalling ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
                <Zap className="text-cyan-500 mb-4 animate-bounce" size={48} />
                <button
                  onClick={handleCall}
                  className="px-8 py-3 bg-cyan-500 text-black font-black rounded-sm hover:bg-cyan-400 transition-all uppercase tracking-[0.2em] text-sm"
                >
                  Establecer Enlace
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-cover grayscale-[0.2] contrast-125"
                autoPlay
                playsInline
              />
            )}

            {/* Overlay de Carga */}
            {isCalling && !stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                <span className="text-cyan-500 animate-pulse tracking-[0.5em] text-xs">
                  SINCRONIZANDO...
                </span>
              </div>
            )}
          </div>

          {/* HUD Circular Rotatorio */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-10 border-t-2 border-l-2 border-cyan-500/10 rounded-full pointer-events-none"
          />
        </div>

        {/* Decoración HUD Derecha */}
        <div className="absolute right-0 bottom-1/4 space-y-8 hidden lg:block text-cyan-500/50 text-right">
          <div className="flex items-center justify-end gap-4">
            <span className="text-[10px] tracking-tighter">
              PROTOCOLO: SECURE
            </span>
            <div className="h-[2px] w-24 bg-cyan-900/50" />
            <ShieldCheck size={18} />
          </div>
        </div>

        {/* CONTROLES DE LLAMADA (Flotantes Abajo) */}
        <AnimatePresence>
          {isCalling && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-[-60px] flex items-center gap-8 bg-black/80 backdrop-blur-2xl px-10 py-5 rounded-2xl border border-white/10"
            >
              <button className="text-white/40 hover:text-cyan-400 transition-colors">
                <Mic size={24} />
              </button>

              <div className="h-8 w-[1px] bg-white/10" />

              <button
                onClick={() => window.location.reload()}
                className="p-4 bg-red-600/20 hover:bg-red-600 rounded-full text-red-500 hover:text-white transition-all border border-red-500/50"
              >
                <PhoneOff size={28} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Esquinas Decorativas */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-cyan-500/20" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-cyan-500/20" />
    </main>
  );
}
