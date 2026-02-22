"use client";

import { useStreamingAvatar } from "@/packages/avatar/useStreamingAvatar";
import { useAudioProcessor } from "@/packages/avatar/useAudioProcessor";
import HoloAvatar from "@/packages/ui/HoloAvatar";
import { motion } from "framer-motion";

export default function NoctraInterface() {
  const { status, stream, handleCall } = useStreamingAvatar();
  // Extraemos tanto isSpeaking como el valor crudo del volumen
  const { isSpeaking, volume } = useAudioProcessor(stream);

  return (
    <div className="relative z-20 h-full w-full flex items-center justify-center">
      
      {/* MONITOR DE SEÑAL (Esquina inferior derecha) */}
      <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-[8px] font-mono text-cyan-500 tracking-[0.3em]">MIC_INPUT_LEVEL</span>
        <div className="flex gap-0.5 h-12 items-end">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-cyan-500/30"
              animate={{
                // Mapeamos el volumen para que cada barra reaccione a un rango
                height: volume > (i * 20) ? `${(i + 1) * 8}%` : "10%",
                backgroundColor: volume > (i * 20) ? "#22d3ee" : "rgba(6, 182, 212, 0.2)"
              }}
            />
          ))}
        </div>
      </div>

      <HoloAvatar 
        status={status} 
        stream={stream} 
        isSpeaking={isSpeaking} 
        onCall={handleCall} 
        // Pasamos el volumen para que la cara también "vibre" con el sonido
        volume={volume} 
      />
    </div>
  );
}