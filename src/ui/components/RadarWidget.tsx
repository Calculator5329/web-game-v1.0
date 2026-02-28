import { useEffect, useRef } from 'react';
import type { StarSystem } from '../../core/types';

interface RadarWidgetProps {
  currentSystem: StarSystem;
  connections: StarSystem[];
  size?: number;
}

export function RadarWidget({ currentSystem, connections, size = 140 }: RadarWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 8;

    let sweepAngle = 0;
    let frame: number;

    const blips = connections.map(sys => {
      const dx = sys.coordinates.x - currentSystem.coordinates.x;
      const dy = sys.coordinates.y - currentSystem.coordinates.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const normDist = Math.min(1, dist / 400);
      return { angle, dist: normDist, danger: sys.dangerLevel, name: sys.name };
    });

    function draw() {
      ctx!.clearRect(0, 0, size, size);

      ctx!.strokeStyle = 'rgba(0,200,255,0.1)';
      ctx!.lineWidth = 0.5;
      for (let r = maxR * 0.25; r <= maxR; r += maxR * 0.25) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.stroke();
      }

      ctx!.strokeStyle = 'rgba(0,200,255,0.06)';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
        ctx!.stroke();
      }

      sweepAngle += 0.02;
      const sweepGrad = ctx!.createConicGradient?.(sweepAngle, cx, cy);
      if (sweepGrad) {
        sweepGrad.addColorStop(0, 'rgba(0,200,255,0.15)');
        sweepGrad.addColorStop(0.1, 'rgba(0,200,255,0)');
        sweepGrad.addColorStop(1, 'rgba(0,200,255,0)');
        ctx!.fillStyle = sweepGrad;
        ctx!.beginPath();
        ctx!.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        ctx!.strokeStyle = 'rgba(0,240,255,0.4)';
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
        ctx!.stroke();

        const fadeGrad = ctx!.createLinearGradient(
          cx, cy,
          cx + Math.cos(sweepAngle - 0.5) * maxR,
          cy + Math.sin(sweepAngle - 0.5) * maxR
        );
        fadeGrad.addColorStop(0, 'rgba(0,200,255,0.08)');
        fadeGrad.addColorStop(1, 'rgba(0,200,255,0)');
        ctx!.fillStyle = fadeGrad;
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.arc(cx, cy, maxR, sweepAngle - 0.6, sweepAngle);
        ctx!.closePath();
        ctx!.fill();
      }

      for (const blip of blips) {
        const bx = cx + Math.cos(blip.angle) * blip.dist * maxR;
        const by = cy + Math.sin(blip.angle) * blip.dist * maxR;

        const angleDiff = Math.abs(((blip.angle - sweepAngle) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        const brightness = angleDiff < 0.5 ? 1 : Math.max(0.3, 1 - angleDiff * 0.3);

        const color = blip.danger > 6 ? `rgba(255,60,80,${brightness})` :
                      blip.danger > 3 ? `rgba(255,200,50,${brightness})` :
                      `rgba(0,230,118,${brightness})`;

        ctx!.fillStyle = color;
        ctx!.beginPath();
        ctx!.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx!.fill();

        const glowSize = 6 + Math.sin(sweepAngle * 2 + blip.angle) * 2;
        const glow = ctx!.createRadialGradient(bx, by, 0, bx, by, glowSize);
        glow.addColorStop(0, color.replace(/[\d.]+\)$/, '0.3)'));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx!.fillStyle = glow;
        ctx!.fillRect(bx - glowSize, by - glowSize, glowSize * 2, glowSize * 2);
      }

      ctx!.fillStyle = 'rgba(0,240,255,0.9)';
      ctx!.beginPath();
      ctx!.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx!.fill();

      const centerGlow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 8);
      centerGlow.addColorStop(0, 'rgba(0,240,255,0.3)');
      centerGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = centerGlow;
      ctx!.fillRect(cx - 8, cy - 8, 16, 16);

      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [currentSystem, connections, size]);

  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      borderRadius: '50%',
      border: '1px solid rgba(0,200,255,0.2)',
      overflow: 'hidden',
      background: 'rgba(0,10,20,0.6)',
    }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
