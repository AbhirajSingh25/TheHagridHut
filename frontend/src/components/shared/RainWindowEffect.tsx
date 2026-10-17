import { useEffect, useRef } from "react";

export default function RainWindowEffect({
  className = "",
  intensity = "subtle",
}: {
  className?: string;
  intensity?: "subtle" | "medium";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect user's reduced motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Number of drops scaled to viewport width (keeps it lightweight)
    const dropCount = Math.min(intensity === "subtle" ? 35 : 60, Math.floor(width / 25));
    const drops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 22 + 10,
      speed: Math.random() * 3 + 2,
      opacity: Math.random() * 0.18 + 0.05,
      width: Math.random() * 1.2 + 0.6,
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      // Throttle to approx 30-40fps for battery efficiency on mobile
      const delta = time - lastTime;
      if (delta < 24) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle amber / warm ambient light reflection on window
      const gradient = ctx.createRadialGradient(
        width * 0.45,
        height * 0.35,
        50,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.6
      );
      gradient.addColorStop(0, "rgba(232, 173, 98, 0.04)");
      gradient.addColorStop(0.5, "rgba(83, 107, 79, 0.02)");
      gradient.addColorStop(1, "rgba(26, 21, 18, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw raindrops
      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1, drop.y + drop.length);
        ctx.strokeStyle = `rgba(241, 228, 204, ${drop.opacity})`;
        ctx.lineWidth = drop.width;
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.3; // Slight angle for gentle wind

        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
      }

      // Only animate if tab is visible
      if (!document.hidden) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 opacity-80 ${className}`}
      aria-hidden="true"
    />
  );
}
