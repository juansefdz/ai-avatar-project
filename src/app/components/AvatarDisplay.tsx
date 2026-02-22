"use client";

import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  VoiceEmotion,
} from "@heygen/streaming-avatar";

export default function AvatarDisplay() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Inicializar el SDK
  const initAvatar = async () => {
    const avatarInstance = new StreamingAvatar({
      token: "TU_API_KEY_AQUI", // Necesitarás generar una en el portal de HeyGen
    });

    setAvatar(avatarInstance);
  };

  // 2. Iniciar la sesión de video
  const startSession = async () => {
    if (!avatar) return;

    const sessionData = await avatar.createStartAvatar({
      quality: AvatarQuality.High,
      avatarName: "George_vines_public", // ID de ejemplo
    });

    // El SDK nos da un stream de MediaStream (WebRTC)
    setStream(avatar.mediaStream);
  };

  // 3. Efecto para vincular el stream al elemento <video>
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [stream]);

  return (
    <div className="flex flex-col items-center gap-4 p-10">
      <div className="relative w-[400px] h-[400px] bg-black rounded-2xl overflow-hidden border-4 border-indigo-500">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={initAvatar}
          className="bg-blue-600 px-4 py-2 rounded text-white"
        >
          1. Inicializar SDK
        </button>
        <button
          onClick={startSession}
          className="bg-green-600 px-4 py-2 rounded text-white"
        >
          2. Aparecer en Pantalla
        </button>
      </div>
    </div>
  );
}
