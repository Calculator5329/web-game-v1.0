import { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { HoloPanel } from '../components/HoloPanel';
import { Button } from '../components/Button';
import { FACTIONS } from '../../data/factions';
import type { StarSystem } from '../../core/types';
import { StarType } from '../../core/types';

const STAR_COLORS: Record<StarType, string> = {
  [StarType.YellowDwarf]: '#ffd54f',
  [StarType.RedGiant]: '#ff7043',
  [StarType.BlueGiant]: '#42a5f5',
  [StarType.WhiteDwarf]: '#e0e0e0',
  [StarType.NeutronStar]: '#ce93d8',
  [StarType.BinaryStar]: '#4fc3f7',
  [StarType.Pulsar]: '#ab47bc',
};

const STAR_SIZES: Record<StarType, number> = {
  [StarType.YellowDwarf]: 6,
  [StarType.RedGiant]: 10,
  [StarType.BlueGiant]: 9,
  [StarType.WhiteDwarf]: 5,
  [StarType.NeutronStar]: 4,
  [StarType.BinaryStar]: 8,
  [StarType.Pulsar]: 5,
};

export const GalaxyView = observer(function GalaxyView() {
  const store = useStore();
  const { galaxyStore, playerStore } = store;
  const [hovered, setHovered] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSystem = galaxyStore.getSystem(playerStore.player.currentSystem);
  const selected = hovered ? galaxyStore.getSystem(hovered) : null;
  const connectedIds = currentSystem?.connections ?? [];

  useEffect(() => {
    if (currentSystem) {
      setOffset({
        x: -(currentSystem.coordinates.x - (containerRef.current?.clientWidth ?? 800) / 2),
        y: -(currentSystem.coordinates.y - (containerRef.current?.clientHeight ?? 600) / 2),
      });
    }
    // Only center on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof SVGCircleElement || e.target instanceof SVGTextElement) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.4, Math.min(2.5, z - e.deltaY * 0.001)));
  }, []);

  const canTravel = (sys: StarSystem) =>
    connectedIds.includes(sys.id) && sys.id !== playerStore.player.currentSystem;

  const fuelCost = (sys: StarSystem) =>
    galaxyStore.getTravelCost(playerStore.player.currentSystem, sys.id);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Map */}
      <div
        style={{ flex: 1, position: 'relative', cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg width="100%" height="100%" style={{ background: 'transparent' }}>
          <defs>
            <filter id="nebula-blur">
              <feGaussianBlur stdDeviation="30" />
            </filter>
            <filter id="star-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g transform={`translate(${offset.x},${offset.y}) scale(${zoom})`}>
            {/* Faction territory nebulae */}
            {galaxyStore.discoveredSystems.filter(s => s.faction).map(sys => {
              const fColor = sys.faction ? FACTIONS[sys.faction].color : '#888';
              return (
                <ellipse key={`neb-${sys.id}`}
                  cx={sys.coordinates.x} cy={sys.coordinates.y}
                  rx={80} ry={60}
                  fill={fColor} opacity={0.03}
                  filter="url(#nebula-blur)"
                />
              );
            })}

            {/* Connections */}
            {galaxyStore.discoveredSystems.map(sys =>
              sys.connections.map(connId => {
                const conn = galaxyStore.getSystem(connId);
                if (!conn || !conn.discovered) return null;
                if (sys.id > connId) return null;
                const isRoute = (sys.id === playerStore.player.currentSystem && connectedIds.includes(connId)) ||
                  (connId === playerStore.player.currentSystem && connectedIds.includes(sys.id));
                return (
                  <g key={`${sys.id}-${connId}`}>
                    <line
                      x1={sys.coordinates.x} y1={sys.coordinates.y}
                      x2={conn.coordinates.x} y2={conn.coordinates.y}
                      stroke={isRoute ? 'rgba(0,240,255,0.25)' : 'rgba(80,100,140,0.1)'}
                      strokeWidth={isRoute ? 1.5 : 0.6}
                      strokeDasharray={isRoute ? 'none' : '5 5'}
                    />
                    {isRoute && (
                      <line
                        x1={sys.coordinates.x} y1={sys.coordinates.y}
                        x2={conn.coordinates.x} y2={conn.coordinates.y}
                        stroke="rgba(0,240,255,0.6)"
                        strokeWidth={0.5}
                        strokeDasharray="3 12"
                        strokeDashoffset="0"
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="-15" dur="1s" repeatCount="indefinite" />
                      </line>
                    )}
                  </g>
                );
              })
            )}

            {/* Systems */}
            {galaxyStore.discoveredSystems.map(sys => {
              const isCurrent = sys.id === playerStore.player.currentSystem;
              const isConnected = connectedIds.includes(sys.id);
              const isHovered = hovered === sys.id;
              const color = STAR_COLORS[sys.starType];
              const size = STAR_SIZES[sys.starType];
              const factionColor = sys.faction ? FACTIONS[sys.faction].color : null;

              return (
                <g key={sys.id}
                  onMouseEnter={() => setHovered(sys.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { if (canTravel(sys)) store.travelToSystem(sys.id); }}
                  style={{ cursor: canTravel(sys) ? 'pointer' : 'default' }}
                >
                  {/* Faction territory */}
                  {factionColor && (
                    <circle cx={sys.coordinates.x} cy={sys.coordinates.y} r={size + 14}
                      fill="none" stroke={factionColor} strokeWidth={0.5} strokeDasharray="3 3" opacity={0.3} />
                  )}

                  {/* Current system pulse */}
                  {isCurrent && (
                    <>
                      <circle cx={sys.coordinates.x} cy={sys.coordinates.y} r={size + 10}
                        fill="none" stroke="var(--cyan)" strokeWidth={1} opacity={0.3}>
                        <animate attributeName="r" from={size + 6} to={size + 18} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}

                  {/* Star glow */}
                  <circle cx={sys.coordinates.x} cy={sys.coordinates.y} r={size + 4}
                    fill={color} opacity={isHovered ? 0.15 : 0.06} />

                  {/* Star */}
                  <circle cx={sys.coordinates.x} cy={sys.coordinates.y} r={isHovered ? size + 2 : size}
                    fill={color}
                    stroke={isCurrent ? 'var(--cyan)' : isConnected ? 'rgba(0,240,255,0.5)' : 'transparent'}
                    strokeWidth={isCurrent ? 2 : 1}
                    opacity={isConnected || isCurrent ? 1 : 0.5}
                    style={{ transition: 'all 0.2s' }}
                  />

                  {/* Label */}
                  <text x={sys.coordinates.x} y={sys.coordinates.y + size + 14}
                    textAnchor="middle" fill={isCurrent ? 'var(--cyan)' : isHovered ? 'var(--text-primary)' : 'var(--text-dim)'}
                    fontSize={isCurrent ? 10 : 8} fontFamily="var(--font-display)"
                    style={{ userSelect: 'none', letterSpacing: '0.5px' }}
                  >
                    {sys.name}
                  </text>

                  {/* Fuel cost label for reachable systems */}
                  {isConnected && !isCurrent && (
                    <text x={sys.coordinates.x} y={sys.coordinates.y - size - 6}
                      textAnchor="middle" fill="var(--amber)" fontSize={7} fontFamily="var(--font-mono)"
                      style={{ userSelect: 'none' }}
                    >
                      ⛽{fuelCost(sys)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} style={{ ...zoomBtnStyle }}>+</button>
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.2))} style={{ ...zoomBtnStyle }}>−</button>
        </div>
      </div>

      {/* Side panel */}
      <div style={{ width: '300px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', background: 'rgba(5,10,24,0.6)' }}>
        {/* Current system info */}
        {currentSystem && (
          <HoloPanel title="Current System" accent="var(--cyan)" corners scanline>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--cyan)', marginBottom: '6px', textShadow: '0 0 10px rgba(0,240,255,0.3)' }}>
              {currentSystem.name}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
              {currentSystem.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Star:</span>
              <span style={{ color: STAR_COLORS[currentSystem.starType] }}>{currentSystem.starType.replace(/_/g, ' ')}</span>
              <span style={{ color: 'var(--text-dim)' }}>Faction:</span>
              <span style={{ color: currentSystem.faction ? FACTIONS[currentSystem.faction].color : 'var(--text-secondary)' }}>
                {currentSystem.faction ? FACTIONS[currentSystem.faction].name : 'Neutral'}
              </span>
              <span style={{ color: 'var(--text-dim)' }}>Danger:</span>
              <span style={{ color: currentSystem.dangerLevel > 6 ? 'var(--red)' : currentSystem.dangerLevel > 3 ? 'var(--amber)' : 'var(--green)' }}>
                {'◆'.repeat(currentSystem.dangerLevel)}{'◇'.repeat(10 - currentSystem.dangerLevel)}
              </span>
              <span style={{ color: 'var(--text-dim)' }}>Tech:</span>
              <span style={{ color: 'var(--blue)' }}>Level {currentSystem.techLevel}</span>
            </div>
          </HoloPanel>
        )}

        {/* Hovered system */}
        {selected && selected.id !== playerStore.player.currentSystem && (
          <HoloPanel title={canTravel(selected) ? 'Travel Available' : 'Out of Range'} accent={canTravel(selected) ? 'var(--green)' : 'var(--text-dim)'} glow={canTravel(selected)} corners>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {selected.name}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
              {selected.description}
            </p>
            {canTravel(selected) && (
              <>
                <div style={{ fontSize: '0.72rem', color: 'var(--amber)', marginBottom: '8px' }}>
                  Fuel cost: {fuelCost(selected)} | Danger: {selected.dangerLevel}/10
                </div>
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => store.travelToSystem(selected.id)}
                  disabled={playerStore.player.ship.fuel < fuelCost(selected)}
                >
                  {playerStore.player.ship.fuel < fuelCost(selected) ? 'Insufficient Fuel' : `Travel to ${selected.name}`}
                </Button>
              </>
            )}
          </HoloPanel>
        )}

        {/* Active quests */}
        <HoloPanel title="Active Quests" accent="var(--purple)" corners>
          {store.storyStore.activeQuests.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No active quests</p>
          ) : (
            store.storyStore.activeQuests.slice(0, 3).map(q => (
              <div key={q.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--purple)', letterSpacing: '0.5px' }}>
                  {q.title}
                </div>
                {q.objectives.filter(o => !o.completed).slice(0, 2).map(o => (
                  <div key={o.id} style={{ fontSize: '0.7rem', color: 'var(--text-dim)', paddingLeft: '8px' }}>
                    ▸ {o.description} ({o.current}/{o.required})
                  </div>
                ))}
              </div>
            ))
          )}
        </HoloPanel>
      </div>
    </div>
  );
});

const zoomBtnStyle: React.CSSProperties = {
  width: '32px', height: '32px', background: 'var(--bg-panel)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '1.1rem',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-mono)',
};
