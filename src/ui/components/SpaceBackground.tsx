import { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
  speed: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: string;
  alpha: number;
  drift: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  color: string;
}

const NEBULA_PALETTE = [
  'rgba(0,180,255,',    // cyan
  'rgba(120,60,220,',   // purple
  'rgba(0,80,200,',     // deep blue
  'rgba(200,50,120,',   // magenta
  'rgba(50,200,150,',   // teal
  'rgba(80,40,160,',    // indigo
];

const STAR_COLORS = [
  '#ddeeff', '#ffffff', '#aaccff', '#ffddcc', '#ffeeaa',
  '#ccddff', '#eeeeff', '#ffccaa',
];

export function SpaceBackground({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    const starCount = Math.floor(400 * intensity);
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random(),
      r: Math.random() * 1.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.003,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));

    const nebulaCount = Math.floor(5 * intensity);
    const nebulae: Nebula[] = Array.from({ length: nebulaCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      rx: Math.random() * 300 + 150,
      ry: Math.random() * 200 + 100,
      color: NEBULA_PALETTE[Math.floor(Math.random() * NEBULA_PALETTE.length)],
      alpha: Math.random() * 0.04 + 0.01,
      drift: (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    const shootingStars: ShootingStar[] = [];
    const particles: Particle[] = Array.from({ length: Math.floor(60 * intensity) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.1,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.3 + 0.05,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));

    let time = 0;

    function draw() {
      time += 0.016;

      ctx!.fillStyle = '#030810';
      ctx!.fillRect(0, 0, w, h);

      const cGrad = ctx!.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
      cGrad.addColorStop(0, 'rgba(8,15,40,1)');
      cGrad.addColorStop(0.5, 'rgba(5,10,25,1)');
      cGrad.addColorStop(1, 'rgba(3,8,16,1)');
      ctx!.fillStyle = cGrad;
      ctx!.fillRect(0, 0, w, h);

      for (const neb of nebulae) {
        neb.x += neb.drift;
        neb.phase += 0.002;
        if (neb.x > w + neb.rx) neb.x = -neb.rx;
        if (neb.x < -neb.rx) neb.x = w + neb.rx;

        const pulse = 1 + Math.sin(neb.phase) * 0.15;
        const grad = ctx!.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.rx * pulse);
        grad.addColorStop(0, neb.color + (neb.alpha * 1.5) + ')');
        grad.addColorStop(0.3, neb.color + (neb.alpha) + ')');
        grad.addColorStop(0.7, neb.color + (neb.alpha * 0.3) + ')');
        grad.addColorStop(1, neb.color + '0)');
        ctx!.fillStyle = grad;

        ctx!.save();
        ctx!.translate(neb.x, neb.y);
        ctx!.scale(1, neb.ry / neb.rx);
        ctx!.translate(-neb.x, -neb.y);
        ctx!.beginPath();
        ctx!.arc(neb.x, neb.y, neb.rx * pulse, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      for (const star of stars) {
        star.phase += star.speed;
        const twinkle = 0.4 + Math.sin(star.phase) * 0.4 + star.z * 0.2;
        const size = star.r * (0.5 + star.z * 0.5);

        ctx!.globalAlpha = Math.max(0.05, twinkle);
        ctx!.fillStyle = star.color;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx!.fill();

        if (star.z > 0.85 && size > 1.2) {
          const glow = ctx!.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 4);
          glow.addColorStop(0, star.color.replace(')', ',0.15)').replace('#', 'rgba('));
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx!.fillStyle = glow;
          ctx!.fillRect(star.x - size * 4, star.y - size * 4, size * 8, size * 8);
        }
      }
      ctx!.globalAlpha = 1;

      if (Math.random() < 0.003 * intensity && shootingStars.length < 3) {
        const angle = Math.random() * 0.5 + 0.2;
        const speed = Math.random() * 6 + 4;
        shootingStars.push({
          x: Math.random() * w * 0.8,
          y: Math.random() * h * 0.3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: Math.random() * 40 + 30,
          length: Math.random() * 60 + 40,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;

        const alpha = 1 - ss.life / ss.maxLife;
        const grad = ctx!.createLinearGradient(
          ss.x, ss.y,
          ss.x - ss.vx * ss.length / ss.vx, ss.y - ss.vy * ss.length / ss.vy
        );
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.3, `rgba(200,220,255,${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(100,150,255,0)');

        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(ss.x, ss.y);
        ctx!.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        ctx!.stroke();

        ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx!.beginPath();
        ctx!.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        ctx!.fill();

        if (ss.life >= ss.maxLife) shootingStars.splice(i, 1);
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx!.globalAlpha = p.alpha * (0.5 + Math.sin(time * 0.5 + p.x * 0.01) * 0.5);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
