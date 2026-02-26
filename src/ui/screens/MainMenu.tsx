import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { ShipClass } from '../../core/types';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; r: number; a: number; speed: number }[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    let frame: number;
    function draw() {
      ctx!.fillStyle = '#050a18';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      stars.forEach(s => {
        s.a += s.speed;
        const alpha = 0.3 + Math.sin(s.a) * 0.5;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200,220,255,${Math.max(0.1, alpha)})`;
        ctx!.fill();
      });

      frame = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />;
}

const SHIP_DESCRIPTIONS: Record<ShipClass, string> = {
  [ShipClass.Scout]: 'Fast and agile. Great fuel economy and speed, but limited cargo and firepower.',
  [ShipClass.Trader]: 'Built for commerce. Massive cargo hold but slow and lightly armed.',
  [ShipClass.Fighter]: 'Born for battle. Dual weapons and strong shields, but limited cargo and fuel.',
  [ShipClass.Explorer]: 'Balanced and adaptable. Excellent fuel range for deep frontier exploration.',
  [ShipClass.Cruiser]: 'A warship. Heavy armament and thick hull, but slow and thirsty.',
  [ShipClass.Dreadnought]: 'The ultimate battleship. Devastating power, but astronomically expensive to operate.',
};

export const MainMenu = observer(function MainMenu() {
  const store = useStore();
  const [showNewGame, setShowNewGame] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [selectedShip, setSelectedShip] = useState<ShipClass>(ShipClass.Scout);

  const handleNewGame = () => {
    const name = playerName.trim() || 'Captain';
    store.startNewGame(name, selectedShip);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <StarField />

      <div style={{
        position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px',
      }}>
        {!showNewGame ? (
          <>
            <div style={{ textAlign: 'center', animation: 'fade-in 1.5s ease' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900,
                color: 'var(--cyan)', letterSpacing: '8px', textShadow: '0 0 40px rgba(0,240,255,0.4)',
                marginBottom: '8px',
              }}>
                THE NEXUS CHRONICLES
              </h1>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)',
                letterSpacing: '4px',
              }}>
                A GALACTIC EXPLORATION RPG
              </p>
              <p style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-dim)',
                marginTop: '8px', fontStyle: 'italic',
              }}>
                Inspired by Asimov · Clarke · Herbert
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fade-in-up 1s ease 0.5s both', minWidth: '240px' }}>
              <Button size="lg" fullWidth onClick={() => setShowNewGame(true)}>New Game</Button>
              <Button size="lg" fullWidth variant="ghost" disabled={!store.hasSaveGame} onClick={() => store.loadSavedGame()}>
                Continue
              </Button>
            </div>

            <p style={{
              position: 'absolute', bottom: '30px', fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '2px',
            }}>
              YEAR 3847 · ORION ARM · MILKY WAY GALAXY
            </p>
          </>
        ) : (
          <Panel title="New Game" accent="var(--cyan)" style={{ width: '520px', animation: 'fade-in-up 0.4s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                  CAPTAIN NAME
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={20}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  CHOOSE YOUR SHIP
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[ShipClass.Scout, ShipClass.Trader, ShipClass.Fighter, ShipClass.Explorer].map(sc => (
                    <div
                      key={sc}
                      onClick={() => setSelectedShip(sc)}
                      style={{
                        padding: '10px 12px', borderRadius: 'var(--radius)', cursor: 'pointer',
                        border: `1px solid ${selectedShip === sc ? 'var(--cyan)' : 'var(--border)'}`,
                        background: selectedShip === sc ? 'rgba(0,240,255,0.08)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: selectedShip === sc ? 'var(--cyan)' : 'var(--text-primary)', textTransform: 'capitalize', letterSpacing: '1px' }}>
                        {sc}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.3 }}>
                        {SHIP_DESCRIPTIONS[sc]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <Button variant="ghost" onClick={() => setShowNewGame(false)} style={{ flex: 1 }}>Back</Button>
                <Button onClick={handleNewGame} style={{ flex: 2 }}>Launch</Button>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
});
