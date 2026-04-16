"use client";

import { useEffect, useRef } from "react";

export function BackgroundSwirl() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let frame = 0;

    const resize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);

      context.fillStyle = "#12001f";
      context.fillRect(0, 0, width, height);

      const gradients = [
        { x: width * (0.25 + Math.sin(time / 4200) * 0.08), y: height * 0.28, radius: width * 0.45, color: "rgba(95, 39, 205, 0.28)" },
        { x: width * (0.72 + Math.cos(time / 5300) * 0.06), y: height * 0.65, radius: width * 0.4, color: "rgba(11, 35, 99, 0.28)" },
        { x: width * (0.5 + Math.sin(time / 3100) * 0.05), y: height * (0.55 + Math.cos(time / 4700) * 0.05), radius: width * 0.5, color: "rgba(245, 200, 66, 0.12)" },
      ];

      for (const item of gradients) {
        const gradient = context.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.radius);
        gradient.addColorStop(0, item.color);
        gradient.addColorStop(0.5, "rgba(26, 10, 46, 0.15)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-swirl" aria-hidden="true" />;
}
