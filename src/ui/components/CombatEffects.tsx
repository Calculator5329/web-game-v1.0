import { useEffect, useRef } from 'react';

interface CombatEffectsProps {
  effects: CombatVFX[];
  width: number;
  height: number;
}

export interface CombatVFX {
  type: 'laser' | 'explosion' | 'shield_hit' | 'missile';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  startTime: number;
}

interface EffectParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  color: string;
  type: 'spark' | 'ring' | 'trail';
}

export function CombatEffects({ effects, width, height }: CombatEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<EffectParticle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const now = Date.now();
      const particles = particlesRef.current;

      for (const fx of effects) {
        const elapsed = now - fx.startTime;
        if (elapsed > 1500) continue;

        if (fx.type === 'laser') {
          const progress = Math.min(1, elapsed / 200);
          const fadeOut = elapsed > 200 ? Math.max(0, 1 - (elapsed - 200) / 300) : 1;

          const dx = fx.toX - fx.fromX;
          const dy = fx.toY - fx.fromY;
          const tipX = fx.fromX + dx * progress;
          const tipY = fx.fromY + dy * progress;

          ctx!.strokeStyle = fx.color;
          ctx!.lineWidth = 3;
          ctx!.globalAlpha = fadeOut;
          ctx!.shadowColor = fx.color;
          ctx!.shadowBlur = 15;
          ctx!.beginPath();
          ctx!.moveTo(fx.fromX, fx.fromY);
          ctx!.lineTo(tipX, tipY);
          ctx!.stroke();

          ctx!.lineWidth = 1;
          ctx!.globalAlpha = fadeOut * 0.5;
          ctx!.beginPath();
          ctx!.moveTo(fx.fromX, fx.fromY);
          ctx!.lineTo(tipX, tipY);
          ctx!.stroke();

          ctx!.shadowBlur = 0;
          ctx!.globalAlpha = 1;

          if (progress >= 1 && elapsed < 250) {
            for (let i = 0; i < 8; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 3 + 1;
              particles.push({
                x: fx.toX, y: fx.toY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0, maxLife: 20 + Math.random() * 15,
                r: Math.random() * 2 + 1,
                color: fx.color,
                type: 'spark',
              });
            }
          }
        }

        if (fx.type === 'explosion') {
          const progress = Math.min(1, elapsed / 600);
          const rings = 3;
          for (let i = 0; i < rings; i++) {
            const ringProgress = Math.max(0, Math.min(1, (progress - i * 0.15) / 0.7));
            const radius = ringProgress * 40;
            const alpha = (1 - ringProgress) * 0.6;
            ctx!.strokeStyle = fx.color;
            ctx!.lineWidth = 2 * (1 - ringProgress);
            ctx!.globalAlpha = alpha;
            ctx!.beginPath();
            ctx!.arc(fx.toX, fx.toY, radius, 0, Math.PI * 2);
            ctx!.stroke();
          }

          const coreAlpha = Math.max(0, 1 - progress * 1.5);
          const grad = ctx!.createRadialGradient(fx.toX, fx.toY, 0, fx.toX, fx.toY, 20 * (1 - progress * 0.5));
          grad.addColorStop(0, `rgba(255,255,255,${coreAlpha})`);
          grad.addColorStop(0.4, fx.color.replace(')', `,${coreAlpha * 0.8})`));
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx!.globalAlpha = 1;
          ctx!.fillStyle = grad;
          ctx!.fillRect(fx.toX - 25, fx.toY - 25, 50, 50);

          if (elapsed < 100) {
            for (let i = 0; i < 3; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 4 + 2;
              particles.push({
                x: fx.toX, y: fx.toY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0, maxLife: 30 + Math.random() * 20,
                r: Math.random() * 3 + 1,
                color: fx.color,
                type: 'spark',
              });
            }
          }
        }

        if (fx.type === 'shield_hit') {
          const progress = Math.min(1, elapsed / 400);
          const radius = 35 + progress * 10;
          const alpha = (1 - progress) * 0.5;

          ctx!.globalAlpha = alpha;
          ctx!.strokeStyle = fx.color;
          ctx!.lineWidth = 2;
          ctx!.setLineDash([4, 4]);
          ctx!.beginPath();
          ctx!.arc(fx.toX, fx.toY, radius, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.setLineDash([]);

          const hexSize = 8;
          const hexAlpha = alpha * 0.6;
          ctx!.globalAlpha = hexAlpha;
          ctx!.strokeStyle = fx.color;
          ctx!.lineWidth = 1;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            const hx = fx.toX + Math.cos(a + progress * 2) * radius * 0.7;
            const hy = fx.toY + Math.sin(a + progress * 2) * radius * 0.7;
            drawHexagon(ctx!, hx, hy, hexSize);
          }
        }

        if (fx.type === 'missile') {
          const progress = Math.min(1, elapsed / 400);
          const x = fx.fromX + (fx.toX - fx.fromX) * progress;
          const y = fx.fromY + (fx.toY - fx.fromY) * progress;
          const wobble = Math.sin(elapsed * 0.05) * 5;

          ctx!.globalAlpha = 1;
          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(x + wobble, y, 3, 0, Math.PI * 2);
          ctx!.fill();

          const trailGrad = ctx!.createRadialGradient(x + wobble, y, 0, x + wobble, y, 12);
          trailGrad.addColorStop(0, 'rgba(255,150,50,0.6)');
          trailGrad.addColorStop(1, 'rgba(255,50,0,0)');
          ctx!.fillStyle = trailGrad;
          ctx!.fillRect(x + wobble - 12, y - 12, 24, 24);

          particles.push({
            x: x + wobble, y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 0, maxLife: 12,
            r: Math.random() * 2 + 0.5,
            color: 'rgba(255,140,40,',
            type: 'trail',
          });
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.vx *= 0.96;
        p.vy *= 0.96;

        const alpha = 1 - p.life / p.maxLife;
        if (alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx!.globalAlpha = alpha;
        if (p.type === 'trail') {
          ctx!.fillStyle = p.color + `${alpha})`;
        } else {
          ctx!.fillStyle = p.color;
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
      ctx!.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [effects, width, height]);

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }} />
  );
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}
