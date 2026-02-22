"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CallStatus } from "@/packages/avatar/types";

interface HoloAvatarProps {
  status: CallStatus;
  stream?: MediaStream | null;
  isSpeaking?: boolean;
  onCall: () => void;
}

export default function HoloAvatar({ status, isSpeaking = false, onCall }: HoloAvatarProps) {
  const avatarImage = "/avatar.jpg";

  // MÁSCARA RADIAL PARA TAMAÑO GRANDE:
  // Subimos el "black" al 40% y el "transparent" al 85% para que,
  // al aumentar el tamaño, el rostro siga siendo el foco claro.
  const softMask = {
    WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
    maskImage: "radial-gradient(circle at center, black 40%, transparent 85%)"
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-screen overflow-hidden">
      
      {/* AUMENTO DE TAMAÑO: Cambiamos max-w-4xl a max-w-6xl o 7xl */}
      <div className="relative w-full h-full max-w-6xl flex items-center justify-center scale-110">
        
        {/* Aura de fondo expandida */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_75%)] blur-[120px] pointer-events-none" />

        <AnimatePresence mode="wait">
          
          {(status === "idle" || status === "active") && (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* IMAGEN CON ESCALA AUMENTADA */}
              <motion.img
                src={avatarImage}
                alt="Noctra AI"
                style={softMask}
                className="w-full h-full object-contain mix-blend-screen pointer-events-none"
                animate={{ 
                  // Aumentamos la escala base: de 1 a 1.2 o 1.3
                  scale: isSpeaking ? [1.2, 1.25, 1.2] : [1.2, 1.22, 1.2],
                  filter: isSpeaking 
                    ? "brightness(1.4) contrast(1.2) drop-shadow(0 0 50px rgba(34,211,238,0.7))"
                    : "brightness(1.1) contrast(1.1) drop-shadow(0 0 20px rgba(34,211,238,0.3))"
                }}
                transition={{ duration: isSpeaking ? 0.1 : 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Glitch ampliado */}
              {isSpeaking && (
                <motion.img
                  src={avatarImage}
                  style={softMask}
                  animate={{ x: [-8, 8, 0], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                  className="absolute inset-0 w-full h-full object-contain mix-blend-screen hue-rotate-180 opacity-25 scale-125"
                />
              )}

              {/* Botón INIT_TALK */}
              {status === "idle" && (
                <motion.div className="absolute bottom-4 z-20">
                  <button
                    onClick={onCall}
                    className="px-10 py-3 bg-black/40 border border-cyan-500/30 text-cyan-400 font-mono text-xs tracking-[0.6em] rounded-full hover:bg-cyan-500/20 transition-all backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  >
                    INIT_TALK
                  </button>
                </motion.div>
              )}

              {/* Ecualizador más visible */}
              {status === "active" && isSpeaking && (
                <div className="absolute bottom-10 flex gap-1.5 z-20">
                  {[...Array(9)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-1.5 bg-cyan-400 shadow-[0_0_15px_cyan]"
                      animate={{ height: [5, 30, 5] }}
                      transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.04 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}