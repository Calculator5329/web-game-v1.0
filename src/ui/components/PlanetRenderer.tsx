import { useId } from 'react';
import type { PlanetType } from '../../core/types';

interface PlanetRendererProps {
  type: PlanetType;
  size?: number;
  name?: string;
  showRing?: boolean;
}

const PLANET_STYLES: Record<string, { colors: string[]; ringColor?: string; atmosphere?: string; hasRing?: boolean }> = {
  terrestrial: {
    colors: ['#2d8a4e', '#1a6b3a', '#3da663', '#1b5c2f'],
    atmosphere: 'rgba(100,200,255,0.15)',
  },
  gas_giant: {
    colors: ['#e88a3a', '#c4622a', '#f0a050', '#a04820'],
    hasRing: true,
    ringColor: 'rgba(200,160,100,0.3)',
    atmosphere: 'rgba(255,180,80,0.1)',
  },
  ice_world: {
    colors: ['#b8d8f0', '#88b8d8', '#d0eaff', '#6898b8'],
    atmosphere: 'rgba(180,220,255,0.2)',
  },
  volcanic: {
    colors: ['#8b2500', '#cc4400', '#ff6600', '#661a00'],
    atmosphere: 'rgba(255,100,30,0.15)',
  },
  ocean: {
    colors: ['#0a5ca8', '#0d78cc', '#1090e0', '#064080'],
    atmosphere: 'rgba(50,150,255,0.15)',
  },
  desert: {
    colors: ['#c4956a', '#a87844', '#dab088', '#8a6030'],
    atmosphere: 'rgba(220,180,120,0.1)',
  },
  artificial_habitat: {
    colors: ['#556677', '#667788', '#445566', '#778899'],
    hasRing: true,
    ringColor: 'rgba(0,200,255,0.25)',
    atmosphere: 'rgba(0,200,255,0.12)',
  },
};

export function PlanetRenderer({ type, size = 80, name, showRing = true }: PlanetRendererProps) {
  const ps = PLANET_STYLES[type] ?? PLANET_STYLES.terrestrial;
  const r = size / 2;
  const svgSize = size * 1.8;
  const center = svgSize / 2;
  const uid = useId().replace(/:/g, '');

  return (
    <div style={{ position: 'relative', width: svgSize, height: svgSize, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <defs>
          <radialGradient id={`${uid}-grad`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={ps.colors[2]} />
            <stop offset="40%" stopColor={ps.colors[0]} />
            <stop offset="80%" stopColor={ps.colors[1]} />
            <stop offset="100%" stopColor={ps.colors[3]} />
          </radialGradient>
          <radialGradient id={`${uid}-atmo`} cx="50%" cy="50%" r="55%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="90%" stopColor={ps.atmosphere ?? 'rgba(100,200,255,0.1)'} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="60%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="85%" stopColor={ps.atmosphere ?? 'rgba(100,200,255,0.05)'} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <circle cx={center} cy={center} r={r} />
          </clipPath>
        </defs>

        {/* Outer glow */}
        <circle cx={center} cy={center} r={r * 1.4} fill={`url(#${uid}-glow)`}>
          <animate attributeName="r" values={`${r * 1.35};${r * 1.45};${r * 1.35}`} dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Planet surface */}
        <circle cx={center} cy={center} r={r} fill={`url(#${uid}-grad)`} />

        {/* Surface details */}
        <g clipPath={`url(#${uid}-clip)`}>
          {ps.colors.map((c, i) => (
            <ellipse key={i}
              cx={center + (i - 1.5) * r * 0.3}
              cy={center + (i % 2 === 0 ? -1 : 1) * r * 0.2}
              rx={r * 0.4} ry={r * 0.15}
              fill={c} opacity={0.3}
              transform={`rotate(${i * 25}, ${center}, ${center})`}
            >
              <animateTransform attributeName="transform" type="rotate"
                from={`${i * 25} ${center} ${center}`}
                to={`${i * 25 + 360} ${center} ${center}`}
                dur={`${80 + i * 20}s`} repeatCount="indefinite" />
            </ellipse>
          ))}
        </g>

        {/* Atmosphere */}
        <circle cx={center} cy={center} r={r + 2} fill={`url(#${uid}-atmo)`} />

        {/* Specular highlight */}
        <ellipse cx={center - r * 0.2} cy={center - r * 0.25} rx={r * 0.35} ry={r * 0.25}
          fill="rgba(255,255,255,0.08)" transform={`rotate(-20, ${center}, ${center})`} />

        {/* Ring */}
        {showRing && ps.hasRing && (
          <ellipse cx={center} cy={center} rx={r * 1.5} ry={r * 0.3}
            fill="none"
            stroke={ps.ringColor ?? 'rgba(200,200,200,0.2)'}
            strokeWidth={r * 0.08}
            transform={`rotate(-15, ${center}, ${center})`}
          >
            <animateTransform attributeName="transform" type="rotate"
              from={`-15 ${center} ${center}`}
              to={`345 ${center} ${center}`}
              dur="120s" repeatCount="indefinite" />
          </ellipse>
        )}
      </svg>

      {/* Name label */}
      {name && (
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--text-secondary)',
          letterSpacing: '1px', whiteSpace: 'nowrap', textAlign: 'center',
        }}>
          {name}
        </div>
      )}
    </div>
  );
}
