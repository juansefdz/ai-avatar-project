"use client";

import { motion } from "framer-motion";

export default function OpenClawHeart() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center">
      <motion.div
        animate={{
          x: ["-40vw", "20vw", "40vw", "-10vw", "-35vw", "15vw", "-40vw"],
          y: ["-30vh", "-10vh", "25vh", "35vh", "10vh", "-25vh", "-30vh"],
          rotate: [-15, 15, -10, 20, 5, -20, -15],
        }}
        transition={{
          duration: 90, // Movimiento extremadamente lento y majestuoso
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center w-250 h-250"
      >
        {/* HAZ DE LUZ VOLUMÉTRICO MÁS SUTIL Y SUAVIZADO */}
        <motion.div
          className="absolute w-28 h-[140vh] z-0"
          style={{
             background: 'linear-gradient(to bottom, transparent 0%, rgba(239, 68, 68, 0.05) 20%, rgba(239, 68, 68, 0.15) 50%, rgba(239, 68, 68, 0.05) 80%, transparent 100%)',
             filter: 'blur(30px)',
             opacity: 0.6
          }}
        />

        {/* ROTACIÓN SUTIL LATERAL MÁS FINA */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-200 h-2 z-10"
          style={{
             background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
             filter: 'blur(20px)',
             opacity: 0.5
          }}
        />

        {/* NÚCLEO CENTRAL INTENSO SIN BORDES MARCADOS */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-30 flex items-center justify-center w-32 h-32"
        >
           {/* Resplandor exterior amplio y suave */}
           <div className="absolute w-full h-full rounded-full bg-red-600/40 blur-[25px] pointer-events-none" />
           
           {/* Resplandor medio intenso */}
           <div className="absolute w-16 h-16 rounded-full bg-red-500/80 blur-md pointer-events-none" />

           {/* Núcleo central brillante sin borde rígido ni demarcación */}
           <div className="absolute w-8 h-8 rounded-full bg-red-400 blur-[6px] pointer-events-none" />
           
           {/* Punto de luz central puro */}
           <div className="absolute w-3 h-3 rounded-full bg-white blur-[2px] pointer-events-none" />
        </motion.div>
      </motion.div>
    </div>
  );
}
