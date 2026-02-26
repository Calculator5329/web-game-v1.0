import { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { CombatAction } from '../../core/types';
import { HoloPanel } from '../components/HoloPanel';
import { Button } from '../components/Button';
import { ShipRenderer } from '../components/ShipRenderer';
import { getShipType } from '../components/shipUtils';
import { CombatEffects, type CombatVFX } from '../components/CombatEffects';

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px' }}>
        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.6rem' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color }}>{value}/{max}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: '3px', transition: 'width 0.4s ease', boxShadow: `0 0 8px ${color}44` }} />
      </div>
    </div>
  );
}

export const CombatView = observer(function CombatView() {
  const store = useStore();
  const { combatStore, playerStore } = store;
  const { state } = combatStore;
  const ship = playerStore.player.ship;
  const enemy = state.enemy;
  const [effects, setEffects] = useState<CombatVFX[]>([]);

  const addEffect = useCallback((type: CombatVFX['type'], fromPlayer: boolean, color: string) => {
    const fx: CombatVFX = {
      type,
      fromX: fromPlayer ? 250 : 750,
      fromY: 200,
      toX: fromPlayer ? 750 : 250,
      toY: 200,
      color,
      startTime: Date.now(),
    };
    setEffects(prev => [...prev.filter(e => Date.now() - e.startTime < 2000), fx]);
  }, []);

  const handleAction = useCallback((action: CombatAction) => {
    if (action === CombatAction.Attack || action === CombatAction.HeavyAttack) {
      const weaponType = ship.weapons[0]?.type;
      if (weaponType === 'missile') addEffect('missile', true, '#ff8844');
      else addEffect('laser', true, '#00e0ff');
    }

    combatStore.performAction(action);

    if (action !== CombatAction.Flee && state.result === 'pending') {
      setTimeout(() => {
        if (state.enemy && state.enemy.hull > 0) {
          addEffect('laser', false, '#ff4444');
        }
      }, 400);
    }
  }, [combatStore, addEffect, ship.weapons, state.result, state.enemy]);

  if (!enemy) return null;

  const isOver = state.result !== 'pending';
  const playerDamaged = ship.hull < ship.maxHull * 0.5;
  const enemyDamaged = enemy.hull < enemy.maxHull * 0.5;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px', gap: '12px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', letterSpacing: '3px', fontSize: '1.1rem', textShadow: '0 0 20px rgba(255,60,80,0.5)' }}>
          ⚔ COMBAT — ROUND {state.round} ⚔
        </h2>
      </div>

      {/* Battle arena */}
      <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,60,80,0.1)', overflow: 'hidden' }}>
        <CombatEffects effects={effects} width={1000} height={220} />
        <div style={{ zIndex: 2, textAlign: 'center' }}>
          <ShipRenderer
            type={getShipType(ship.name, true)}
            size={100}
            damaged={playerDamaged}
            shieldActive={ship.shields > 0}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: '1px', marginTop: '4px' }}>{ship.name}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text-dim)', zIndex: 2, textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>VS</div>
        <div style={{ zIndex: 2, textAlign: 'center' }}>
          <ShipRenderer
            type={getShipType(enemy.name, false)}
            size={100}
            damaged={enemyDamaged}
            shieldActive={enemy.shields > 0}
            style={{ transform: 'scaleX(-1)' }}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--red)', letterSpacing: '1px', marginTop: '4px' }}>{enemy.name}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <HoloPanel title={ship.name} accent="var(--cyan)" style={{ flex: 1 }} corners>
          <Bar value={ship.hull} max={ship.maxHull} color="var(--green)" label="Hull" />
          <Bar value={ship.shields} max={ship.maxShields} color="var(--cyan)" label="Shields" />
          <Bar value={ship.energy} max={ship.maxEnergy} color="var(--amber)" label="Energy" />
        </HoloPanel>
        <HoloPanel title={enemy.name} accent="var(--red)" style={{ flex: 1 }} corners>
          <Bar value={enemy.hull} max={enemy.maxHull} color="var(--red)" label="Hull" />
          <Bar value={enemy.shields} max={enemy.maxShields} color="var(--purple)" label="Shields" />
          <Bar value={enemy.energy} max={enemy.maxEnergy} color="var(--amber)" label="Energy" />
        </HoloPanel>
      </div>

      {/* Combat log */}
      <HoloPanel title="Combat Log" accent="var(--text-dim)" style={{ flex: 1, overflowY: 'auto', minHeight: '80px' }} scanline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {state.log.slice(-5).map((entry, i) => (
            <div key={i} style={{
              fontSize: '0.78rem', fontFamily: 'var(--font-mono)',
              color: entry.actor === 'player' ? 'var(--cyan)' : 'var(--red)',
              padding: '2px 0',
            }}>
              <span style={{ color: 'var(--text-dim)', marginRight: '8px' }}>
                {entry.round > 0 ? `[R${entry.round}]` : '[!]'}
              </span>
              {entry.message}
            </div>
          ))}
        </div>
      </HoloPanel>

      {/* Actions */}
      {!isOver ? (
        <HoloPanel title={state.playerTurn ? 'Your Turn' : 'Enemy Turn'} accent={state.playerTurn ? 'var(--cyan)' : 'var(--red)'} glow corners>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            <Button onClick={() => handleAction(CombatAction.Attack)} disabled={!state.playerTurn}>Attack</Button>
            <Button onClick={() => handleAction(CombatAction.HeavyAttack)} disabled={!state.playerTurn} variant="danger">Heavy</Button>
            <Button onClick={() => handleAction(CombatAction.Defend)} disabled={!state.playerTurn} variant="ghost">Defend</Button>
            <Button onClick={() => handleAction(CombatAction.Repair)} disabled={!state.playerTurn} variant="success">Repair</Button>
            <Button onClick={() => handleAction(CombatAction.Flee)} disabled={!state.playerTurn} variant="amber">Flee</Button>
          </div>
        </HoloPanel>
      ) : (
        <HoloPanel title={state.result === 'victory' ? '🏆 Victory!' : state.result === 'fled' ? '🏃 Escaped!' : '💀 Defeat'} accent={state.result === 'defeat' ? 'var(--red)' : 'var(--green)'} glow corners>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {state.result === 'victory' && `You destroyed ${enemy.name}! Earned ${enemy.credits} credits and ${enemy.xp} XP.`}
              {state.result === 'fled' && 'You escaped the battle. Live to fight another day.'}
              {state.result === 'defeat' && 'Your ship was disabled. Emergency systems activated — you survived, but at a cost.'}
            </p>
            <Button onClick={() => store.finishCombat()}>
              {state.result === 'defeat' ? 'Limp Away' : 'Continue'}
            </Button>
          </div>
        </HoloPanel>
      )}
    </div>
  );
});
