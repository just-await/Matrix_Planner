"use client";

import { useEffect, useRef } from "react";
import { getThemeById } from "@/lib/themes";

interface MatrixRainProps {
  active: boolean;
  themeId?: string;
}

const DEAD_DROP = -9999;

export const MatrixRain = ({ active, themeId = "classic-matrix" }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(active);
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    activeRef.current = active;

    if (active && canvasRef.current) {
      const canvas = canvasRef.current;
      const fontSize = 14;
      const columns = Math.floor(canvas.width / fontSize);

      dropsRef.current = Array.from({ length: columns }, () => 
        Math.floor(Math.random() * -120)
      );
    }
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZMATRIXPLANNER_#$@%&*";
    const fontSize = 14;

    const draw = () => {
      frameCount++;

      if (frameCount % 3 === 0) {
        ctx.fillStyle = "rgba(3, 7, 3, 0.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Используем цвет текущей темы!
        const theme = getThemeById(themeId);
        ctx.fillStyle = theme.primaryHex;
        ctx.font = `${fontSize}px monospace`;

        const drops = dropsRef.current;
        let liveDrops = 0;

        for (let i = 0; i < drops.length; i++) {
          if (drops[i] === DEAD_DROP) continue;

          drops[i]++;

          if (drops[i] >= 0) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            ctx.fillText(text, x, y);
          }

          if (drops[i] * fontSize > canvas.height) {
            if (activeRef.current) {
              drops[i] = Math.floor(Math.random() * -40);
              liveDrops++;
            } else {
              drops[i] = DEAD_DROP;
            }
          } else {
            liveDrops++;
          }
        }

        if (!activeRef.current && liveDrops === 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeId]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
    />
  );
};