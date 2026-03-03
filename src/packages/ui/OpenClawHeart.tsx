"use client";

import { motion } from "framer-motion";

export default function OpenClawHeart() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <motion.div
        animate={{
          x: ["10vw", "85vw", "15vw", "75vw", "10vw"],
          y: ["15vh", "40vh", "80vh", "20vh", "15vh"],
          scale: [1, 1.15, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center w-60 h-60"
      >
        {/* Aura Exterior (Difuminado suave) */}
        <motion.div
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-red-600/20 rounded-full blur-[80px]"
        />

        {/* Orbe Central (Punto medio entre difuso y sólido) */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.9, 0.6],
            boxShadow: [
              "0 0 40px rgba(239, 68, 68, 0.4)",
              "0 0 80px rgba(239, 68, 68, 0.7)",
              "0 0 40px rgba(239, 68, 68, 0.4)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-20 h-20 bg-red-600/80 rounded-full relative z-10 blur-[12px] border border-red-500/30"
        >
          {/* Núcleo de Energía (Lo que le da el toque "marcado" interno) */}
          <motion.div 
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-5 bg-white/40 rounded-full blur-[8px]"
          />
        </motion.div>

        {/* Halo de Energía Circular */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [0.9, 1.4, 0.9],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" }, 
            scale: { duration: 8, repeat: Infinity },
            opacity: { duration: 8, repeat: Infinity }
          }}
          className="absolute w-48 h-48 border border-red-500/20 rounded-full blur-[30px]"
        />
      </motion.div>
    </div>
  );
}
