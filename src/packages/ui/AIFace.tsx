"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function AIFace() {
  // 1. Creamos valores de movimiento crudos (empiezan en el centro: 0.5)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // 2. Suavizamos los valores con springs para que no se vea robótico
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  // 3. LA SOLUCIÓN AL ERROR: Usamos useTransform para hacer las matemáticas de forma segura.
  // Mapeamos el valor de [0 a 1] a los grados o píxeles que queremos.
  const rotateX = useTransform(smoothY, [0, 1], [15, -15]); 
  const rotateY = useTransform(smoothX, [0, 1], [-15, 15]);
  
  const lightX = useTransform(smoothX, [0, 1], [-150, 150]);
  const lightY = useTransform(smoothY, [0, 1], [-150, 150]);

  // 4. Función para leer el mouse sobre el contenedor
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    // Convertimos la posición a un valor relativo entre 0 y 1
    mouseX.set((clientX - left) / width);
    mouseY.set((clientY - top) / height);
  };

  const handleMouseLeave = () => {
    // Cuando el mouse sale, la cara vuelve a mirar al frente suavemente
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center perspective-distant overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* 1. Aura de fondo profunda */}
      <motion.div 
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.2),transparent_70%)] blur-3xl pointer-events-none"
      />

      {/* 2. Contenedor 3D de la Imagen */}
      <motion.div
        className="relative w-full h-full z-10 flex items-center justify-center"
        style={{ rotateX, rotateY }} // <-- Pasamos los valores transformados aquí
      >
        <motion.img
          src="/avatar.jpg" 
          alt="AI Agent Face"
          className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mix-blend-screen"
          style={{
            WebkitMaskImage: "radial-gradient(ellipse at center, black 65%, transparent 100%)",
            maskImage: "radial-gradient(ellipse at center, black 65%, transparent 100%)"
          }}
          animate={{ 
            y: [-8, 8, -8],
            filter: [
              "drop-shadow(0 0 15px rgba(34,211,238,0.4)) brightness(1)",
              "drop-shadow(0 0 30px rgba(34,211,238,0.8)) brightness(1.1)",
              "drop-shadow(0 0 15px rgba(34,211,238,0.4)) brightness(1)"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 3. Reflejo dinámico que sigue al mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8), transparent 50%)`,
            x: lightX, // <-- Pasamos la luz aquí
            y: lightY,
          }}
        />
      </motion.div>

    </div>
  );
}