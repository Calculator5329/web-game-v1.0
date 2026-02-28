import { type ReactNode, type CSSProperties, useEffect, useRef } from 'react';

interface HoloPanelProps {
  children: ReactNode;
  title?: string;
  accent?: string;
  style?: CSSProperties;
  glow?: boolean;
  scanline?: boolean;
  corners?: boolean;
  onClick?: () => void;
}

export function HoloPanel({
  children, title, accent = 'var(--cyan)', style,
  glow, scanline = false, corners = true, onClick,
}: HoloPanelProps) {
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scanline || !scanRef.current) return;
    const el = scanRef.current;
    let pos = -5;
    let frame: number;
    function animate() {
      pos += 0.3;
      if (pos > 105) pos = -5;
      el.style.top = `${pos}%`;
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [scanline]);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'rgba(8,16,40,0.75)',
        border: '1px solid rgba(0,200,255,0.12)',
        borderRadius: '6px',
        padding: '16px',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        ...(glow ? { boxShadow: `0 0 20px ${accent}15, inset 0 0 20px ${accent}08, 0 0 1px ${accent}40` } : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
      }} />

      {/* Animated corners */}
      {corners && (
        <>
          <Corner pos="top-left" color={accent} />
          <Corner pos="top-right" color={accent} />
          <Corner pos="bottom-left" color={accent} />
          <Corner pos="bottom-right" color={accent} />
        </>
      )}

      {/* Scanline */}
      {scanline && (
        <div ref={scanRef} style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: `linear-gradient(180deg, transparent, ${accent}20, transparent)`,
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}

      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(${accent}05 1px, transparent 1px),
          linear-gradient(90deg, ${accent}05 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        opacity: 0.3,
      }} />

      {/* Title */}
      {title && (
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${accent}22`,
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: accent, boxShadow: `0 0 6px ${accent}`,
            display: 'inline-block',
          }}>
            <style>{`@keyframes holo-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
          </span>
          {title}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}

function Corner({ pos, color }: { pos: string; color: string }) {
  const size = 12;
  const isTop = pos.includes('top');
  const isLeft = pos.includes('left');

  return (
    <svg
      width={size} height={size}
      style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: '-1px',
        [isLeft ? 'left' : 'right']: '-1px',
        zIndex: 3,
      }}
    >
      <path
        d={isTop && isLeft ? `M0,${size} L0,0 L${size},0` :
           isTop && !isLeft ? `M0,0 L${size},0 L${size},${size}` :
           !isTop && isLeft ? `M0,0 L0,${size} L${size},${size}` :
           `M0,${size} L${size},${size} L${size},0`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.7"
      >
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
