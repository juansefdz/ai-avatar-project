"use client";

import { Mic, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Definimos la interfaz para eliminar el error de ESLint '@typescript-eslint/no-explicit-any'
 */
interface CallControlsProps {
  visible: boolean;
  onHangUp: () => void;
}

export default function CallControls({ visible, onHangUp }: CallControlsProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-cyan-950/20 backdrop-blur-2xl px-8 py-4 rounded-2xl border border-cyan-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Botón de Micrófono con efecto de pulso activo */}
          <button 
            className="group relative p-3 text-cyan-400/40 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-xl transition-all duration-300"
            aria-label="Silenciar"
          >
            <Mic size={22} />
            {/* Brillo sutil de estado activo */}
            <div className="absolute inset-0 rounded-xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
          </button>
          
          {/* Separador elegante */}
          <div className="h-8 w-px bg-linear-to-b from-transparent via-cyan-500/20 to-transparent" />

          {/* Botón de Colgar - Estética 'Danger Glass' */}
          <button
            onClick={onHangUp}
            className="group relative p-4 bg-red-500/5 border border-red-500/20 text-red-500/80 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-400 transition-all duration-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]"
            aria-label="Desconectar enlace"
          >
            <PhoneOff size={24} className="relative z-10" />
            
            {/* Reflejo interno de cristal al pasar el mouse */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}