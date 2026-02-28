import { useEffect, useRef } from 'react';

interface WarpEffectProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function WarpEffect({ active, onComplete, duration = 1200 }: WarpEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const cx = w / 2;
    const cy = h / 2;

    interface WarpStar {
      angle: number;
      dist: number;
      speed: number;
      color: string;
      width: number;
    }

    const stars: WarpStar[] = Array.from({ length: 200 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 50 + 10,
      speed: Math.random() * 8 + 4,
      color: ['#ffffff', '#aaddff', '#88ccff', '#ccddff'][Math.floor(Math.random() * 4)],
      width: Math.random() * 2 + 0.5,
    }));

    const startTime = Date.now();
    let frame: number;

    function draw() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx!.fillStyle = `rgba(3,8,16,${0.3 + progress * 0.2})`;
      ctx!.fillRect(0, 0, w, h);

      const acceleration = 1 + progress * 15;
      const stretchFactor = 1 + progress * 40;

      for (const star of stars) {
        star.dist += star.speed * acceleration * 0.16;

        const x1 = cx + Math.cos(star.angle) * star.dist;
        const y1 = cy + Math.sin(star.angle) * star.dist;
        const streakLength = star.speed * stretchFactor;
        const x2 = cx + Math.cos(star.angle) * (star.dist - streakLength);
        const y2 = cy + Math.sin(star.angle) * (star.dist - streakLength);

        if (x1 < -50 || x1 > w + 50 || y1 < -50 || y1 > h + 50) {
          star.dist = Math.random() * 20 + 5;
        }

        const alpha = Math.min(1, star.dist / 100) * (progress < 0.8 ? 1 : (1 - progress) * 5);
        ctx!.strokeStyle = star.color;
        ctx!.lineWidth = star.width;
        ctx!.globalAlpha = alpha;
        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
      }

      const coreRadius = 10 + progress * 30;
      const coreGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      coreGrad.addColorStop(0, `rgba(200,240,255,${0.3 * (1 - progress)})`);
      coreGrad.addColorStop(0.5, `rgba(100,180,255,${0.15 * (1 - progress)})`);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = coreGrad;
      ctx!.fillRect(cx - coreRadius, cy - coreRadius, coreRadius * 2, coreRadius * 2);

      if (progress >= 0.9) {
        const flashAlpha = (progress - 0.9) * 10;
        ctx!.fillStyle = `rgba(200,230,255,${flashAlpha * 0.5})`;
        ctx!.fillRect(0, 0, w, h);
      }

      if (progress < 1) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx!.fillStyle = 'rgba(200,230,255,0.3)';
        ctx!.fillRect(0, 0, w, h);
        setTimeout(() => onComplete?.(), 100);
      }
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 500, pointerEvents: 'none',
    }} />
  );
}
