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

export default function HoloAvatar({ status, isSpeaking = false, onCall, volume = 0 }: HoloAvatarProps) {
  const avatarImage = "/avatar.png";

  const hdMask = {
    WebkitMaskImage: "radial-gradient(ellipse 65% 85% at center, black 55%, transparent 88%)",
    maskImage: "radial-gradient(ellipse 65% 85% at center, black 55%, transparent 88%)"
  };

  // Escala y brillo dinámicos
  const dynamicScale = 1.2 + (volume / 900);
  const dynamicBrightness = 1.15 + (volume / 400);

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      
      <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
        
        {/* Aura de contraste (Cyan suave) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_70%)] blur-[120px] pointer-events-none" />

        <AnimatePresence mode="wait">
          
          {status === "connecting" && (
            <motion.div key="connecting" className="absolute inset-0 z-50 flex flex-col items-center justify-center">
              <Zap className="text-cyan-400 animate-pulse mb-3" size={32} />
              <span className="text-cyan-500 font-mono text-[9px] tracking-[0.4em] animate-pulse uppercase">
                Estableciendo enlace...
              </span>
            </motion.div>
          )}

          {(status === "idle" || status === "active") && (
            <motion.div
              key={status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* IMAGEN CON FOCO AMPLIADO */}
              <motion.img
                src={avatarImage}
                alt="Noctra AI"
                style={hdMask}
                className="w-full h-full object-contain mix-blend-screen pointer-events-none"
                animate={{ 
                  scale: isSpeaking ? dynamicScale : [1.18, 1.2, 1.18],
                  filter: isSpeaking 
                    ? `brightness(${dynamicBrightness + 0.2}) contrast(1.2) drop-shadow(0 0 40px rgba(34,211,238,0.5))`
                    : `brightness(${dynamicBrightness}) contrast(1.1) drop-shadow(0 0 20px rgba(34,211,238,0.2))`
                }}
                transition={{ duration: isSpeaking ? 0.1 : 6, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Controles y UI */}
              <div className="absolute bottom-12 z-30 flex flex-col items-center">
                {status === "idle" ? (
                  <button
                    onClick={onCall}
                    className="px-8 py-2.5 bg-black/60 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] tracking-[0.5em] rounded-full hover:bg-cyan-500/40 transition-all backdrop-blur-md shadow-lg"
                  >
                    INIT_TALK
                  </button>
                ) : (
                  isSpeaking && (
                    <div className="flex gap-1 items-end h-8">
                      {[...Array(7)].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="w-1 bg-cyan-400/80 shadow-[0_0_8px_cyan]"
                          animate={{ height: [4, Math.min(volume / 4, 25) + 5, 4] }}
                          transition={{ duration: 0.1, repeat: Infinity, delay: i * 0.03 }}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}