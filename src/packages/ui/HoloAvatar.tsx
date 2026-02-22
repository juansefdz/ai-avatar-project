"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import type { CallStatus } from "@/packages/avatar/types";

interface HoloAvatarProps {
  status: CallStatus;
  stream?: MediaStream | null;
  isSpeaking?: boolean;
  onCall: () => void;
  volume?: number;
}

export default function HoloAvatar({ 
  status, 
  isSpeaking = false, 
  onCall, 
  volume = 0 
}: HoloAvatarProps) {
  // Ajusta esta ruta a tu imagen real
  const avatarImage = "/avatar.png";

  // Máscara elíptica para suavizar bordes y dar aspecto de holograma
  const hdMask = {
    WebkitMaskImage: "radial-gradient(ellipse 65% 85% at center, black 55%, transparent 88%)",
    maskImage: "radial-gradient(ellipse 65% 85% at center, black 55%, transparent 88%)"
  };

  // Cálculos dinámicos basados en el volumen de entrada
  const dynamicScale = 1.2 + (volume / 800);
  const dynamicBrightness = 1.15 + (volume / 400);
  const chromaticOffset = isSpeaking ? Math.min(volume / 50, 8) : 0;

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      
      <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
        
        {/* ── CAPA DE FONDO: AURA CYAN ── */}
        <motion.div 
          animate={{ 
            opacity: isSpeaking ? [0.1, 0.2, 0.1] : 0.1,
            scale: isSpeaking ? [1, 1.1, 1] : 1 
          }}
          transition={{ duration: 0.2, repeat: isSpeaking ? Infinity : 0 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.2),transparent_70%)] blur-[120px] pointer-events-none" 
        />

        <AnimatePresence mode="wait">
          
          {/* ── ESTADO: CONECTANDO ── */}
          {status === "connected" && (
            <motion.div 
              key="connected" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            >
              <Zap className="text-cyan-400 animate-pulse mb-3" size={32} />
              <span className="text-cyan-500 font-mono text-[9px] tracking-[0.4em] animate-pulse uppercase">
                Estableciendo enlace...
              </span>
            </motion.div>
          )}

          {/* ── ESTADO: IDLE / ACTIVE ── */}
          {(status === "idle" || status === "active") && (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              
              {/* CONTENEDOR DE LA ENTIDAD DIGITAL */}
              <div className="relative w-full h-full flex items-center justify-center" style={hdMask}>
                
                {/* EFECTO DE SCANLINES (Solo sobre el avatar) */}
                <div className="absolute inset-0 z-10 opacity-[0.12] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,4px_100%]" />

                {/* IMAGEN DEL AVATAR CON REACTIVIDAD PRO */}
                <motion.img
                  src={avatarImage}
                  alt="Noctra AI Entity"
                  className="w-full h-full object-contain mix-blend-screen pointer-events-none"
                  animate={{ 
                    scale: isSpeaking ? dynamicScale : [1.18, 1.2, 1.18],
                    filter: isSpeaking 
                      ? `brightness(${dynamicBrightness + 0.1}) contrast(1.2) drop-shadow(${chromaticOffset}px 0px 2px rgba(255,0,0,0.5)) drop-shadow(-${chromaticOffset}px 0px 2px rgba(0,255,255,0.5))`
                      : `brightness(${dynamicBrightness}) contrast(1.1) drop-shadow(0 0 20px rgba(34,211,238,0.2))`
                  }}
                  transition={{ 
                    duration: isSpeaking ? 0.05 : 6, 
                    repeat: Infinity, 
                    ease: isSpeaking ? "linear" : "easeInOut" 
                  }}
                />
              </div>

              {/* ── INTERFAZ DE CONTROL INFERIOR ── */}
              <div className="absolute bottom-12 z-30 flex flex-col items-center gap-6">
                
                {status === "idle" ? (
                  <motion.button
                    whileHover={{ scale: 1.05, letterSpacing: "0.6em" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCall}
                    className="px-10 py-3 bg-black/40 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] tracking-[0.5em] rounded-full hover:bg-cyan-500/20 transition-all backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                  >
                    INIT_LINK_SEQUENCE
                  </motion.button>
                ) : (
                  /* Visualizador de voz minimalista */
                  <div className="flex gap-1.5 items-end h-10">
                    {[...Array(9)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="w-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)] rounded-full"
                        animate={{ 
                          // eslint-disable-next-line react-hooks/purity
                          height: isSpeaking ? [4, Math.random() * (volume / 3) + 5, 4] : 4,
                          opacity: isSpeaking ? 1 : 0.2
                        }}
                        transition={{ 
                          duration: 0.1, 
                          repeat: Infinity, 
                          delay: i * 0.02 
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Indicador de Transmisión */}
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${isSpeaking ? 'bg-cyan-500 animate-ping' : 'bg-white/10'}`} />
                  <span className="text-[7px] font-mono text-white/20 tracking-[0.3em] uppercase">
                    {isSpeaking ? 'Transmitting_Data' : 'Signal_Standby'}
                  </span>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Marco de enfoque Sci-Fi (Focus Corners) */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10" />
      </div>
    </div>
  );
}