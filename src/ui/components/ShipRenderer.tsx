import { type CSSProperties, useMemo } from 'react';
import type { ShipType } from './shipUtils';

const SHIP_PATHS: Record<ShipType, { path: string; color: string; glow: string; scale?: number }> = {
  player_scout: {
    path: 'M50,5 L60,20 L65,40 L80,50 L65,52 L60,70 L55,80 L50,85 L45,80 L40,70 L35,52 L20,50 L35,40 L40,20 Z',
    color: '#00e0ff',
    glow: 'rgba(0,224,255,0.6)',
  },
  player_fighter: {
    path: 'M50,2 L58,15 L70,30 L85,40 L75,48 L70,45 L62,65 L58,80 L50,90 L42,80 L38,65 L30,45 L25,48 L15,40 L30,30 L42,15 Z',
    color: '#00e0ff',
    glow: 'rgba(0,224,255,0.6)',
    scale: 1.1,
  },
  player_trader: {
    path: 'M50,8 L58,18 L62,35 L72,42 L72,55 L62,60 L58,75 L50,82 L42,75 L38,60 L28,55 L28,42 L38,35 L42,18 Z',
    color: '#00e0ff',
    glow: 'rgba(0,224,255,0.6)',
  },
  player_explorer: {
    path: 'M50,3 L56,20 L60,35 L75,42 L68,48 L60,50 L58,70 L54,82 L50,88 L46,82 L42,70 L40,50 L32,48 L25,42 L40,35 L44,20 Z',
    color: '#00e0ff',
    glow: 'rgba(0,224,255,0.6)',
  },
  enemy_raider: {
    path: 'M50,90 L42,75 L30,65 L15,58 L25,50 L30,45 L38,25 L44,12 L50,5 L56,12 L62,25 L70,45 L75,50 L85,58 L70,65 L58,75 Z',
    color: '#ff5544',
    glow: 'rgba(255,85,68,0.6)',
  },
  enemy_cruiser: {
    path: 'M50,92 L40,78 L32,65 L20,55 L15,48 L22,42 L35,35 L40,18 L46,8 L50,3 L54,8 L60,18 L65,35 L78,42 L85,48 L80,55 L68,65 L60,78 Z',
    color: '#ff3344',
    glow: 'rgba(255,51,68,0.6)',
    scale: 1.2,
  },
  enemy_drone: {
    path: 'M50,88 L40,72 L35,55 L20,50 L35,45 L40,28 L50,12 L60,28 L65,45 L80,50 L65,55 L60,72 Z',
    color: '#cc66ff',
    glow: 'rgba(204,102,255,0.6)',
    scale: 0.8,
  },
  enemy_hulk: {
    path: 'M50,90 L38,80 L25,68 L18,55 L15,45 L20,35 L30,25 L42,15 L50,8 L58,15 L70,25 L80,35 L85,45 L82,55 L75,68 L62,80 Z',
    color: '#ff8844',
    glow: 'rgba(255,136,68,0.6)',
    scale: 1.4,
  },
  enemy_guardian: {
    path: 'M50,92 L35,78 L22,62 L12,48 L18,38 L28,30 L38,18 L46,8 L50,2 L54,8 L62,18 L72,30 L82,38 L88,48 L78,62 L65,78 Z',
    color: '#ffcc00',
    glow: 'rgba(255,204,0,0.6)',
    scale: 1.3,
  },
};

interface ShipRendererProps {
  type: ShipType;
  size?: number;
  style?: CSSProperties;
  damaged?: boolean;
  shieldActive?: boolean;
  className?: string;
}

export function ShipRenderer({ type, size = 120, style, damaged, shieldActive, className }: ShipRendererProps) {
  const ship = SHIP_PATHS[type] ?? SHIP_PATHS.player_scout;
  const scale = ship.scale ?? 1;
  const actualSize = size * scale;

  return (
    <div className={className} style={{ position: 'relative', width: actualSize, height: actualSize, ...style }}>
      {/* Shield bubble */}
      {shieldActive && (
        <svg width={actualSize} height={actualSize} viewBox="0 0 100 100" style={{
          position: 'absolute', inset: 0, zIndex: 1,
          filter: `drop-shadow(0 0 8px ${ship.glow})`,
        }}>
          <ellipse cx="50" cy="50" rx="48" ry="48"
            fill="none" stroke={ship.color} strokeWidth="0.8" opacity="0.4"
            strokeDasharray="4 3">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="rx" values="46;48;46" dur="3s" repeatCount="indefinite" />
            <animate attributeName="ry" values="46;48;46" dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="50" cy="50" rx="44" ry="44"
            fill={`${ship.color}08`} stroke="none">
            <animate attributeName="opacity" values="0.05;0.15;0.05" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </svg>
      )}

      {/* Ship body */}
      <svg width={actualSize} height={actualSize} viewBox="0 0 100 100" style={{
        position: 'absolute', inset: 0, zIndex: 2,
        filter: `drop-shadow(0 0 12px ${ship.glow}) drop-shadow(0 0 4px ${ship.glow})`,
      }}>
        <defs>
          <linearGradient id={`shipGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ship.color} stopOpacity="0.9" />
            <stop offset="50%" stopColor={ship.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={ship.color} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`shipStroke-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={ship.color} />
            <stop offset="100%" stopColor={ship.color} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d={ship.path}
          fill={`url(#shipGrad-${type})`}
          stroke={`url(#shipStroke-${type})`}
          strokeWidth="1"
          strokeLinejoin="round"
          opacity={damaged ? 0.6 : 1}
        />
        {/* Engine glow */}
        <circle cx="50" cy={type.startsWith('enemy') ? '12' : '82'} r="4"
          fill={ship.color} opacity="0.8">
          <animate attributeName="r" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Damage sparks */}
      {damaged && <DamageSparks size={actualSize} />}
    </div>
  );
}

function DamageSparks({ size }: { size: number }) {
  const sparks = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      cx: 30 + ((i * 37 + 13) % 40),
      cy: 30 + ((i * 23 + 7) % 40),
      dur: `${0.3 + (i * 0.12)}s`,
      begin: `${i * 0.12}s`,
    })), []);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{
      position: 'absolute', inset: 0, zIndex: 3,
    }}>
      {sparks.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r="2" fill="#ff6600">
          <animate attributeName="opacity" values="0;1;0" dur={s.dur} repeatCount="indefinite" begin={s.begin} />
        </circle>
      ))}
    </svg>
  );
}

