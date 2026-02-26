import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { CombatAction } from '../../core/types';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px' }}>
        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.6rem' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color }}>{value}/{max}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease', boxShadow: `0 0 8px ${color}44` }} />
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

  if (!enemy) return null;

  const isOver = state.result !== 'pending';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Combat header */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', letterSpacing: '3px', fontSize: '1.2rem' }}>
          ⚔ COMBAT — ROUND {state.round} ⚔
        </h2>
      </div>

      {/* Ships status */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <Panel title={ship.name} accent="var(--cyan)" style={{ flex: 1 }}>
          <Bar value={ship.hull} max={ship.maxHull} color="var(--green)" label="Hull" />
          <Bar value={ship.shields} max={ship.maxShields} color="var(--cyan)" label="Shields" />
          <Bar value={ship.energy} max={ship.maxEnergy} color="var(--amber)" label="Energy" />
        </Panel>

        <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-dim)' }}>
          VS
        </div>

        <Panel title={enemy.name} accent="var(--red)" style={{ flex: 1 }}>
          <Bar value={enemy.hull} max={enemy.maxHull} color="var(--red)" label="Hull" />
          <Bar value={enemy.shields} max={enemy.maxShields} color="var(--purple)" label="Shields" />
          <Bar value={enemy.energy} max={enemy.maxEnergy} color="var(--amber)" label="Energy" />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>
            {enemy.description}
          </p>
        </Panel>
      </div>

      {/* Combat log */}
      <Panel title="Combat Log" accent="var(--text-dim)" style={{ flex: 1, overflowY: 'auto', minHeight: '120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {state.log.map((entry, i) => (
            <div key={i} style={{
              fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
              color: entry.actor === 'player' ? 'var(--cyan)' : 'var(--red)',
              padding: '3px 0',
              borderBottom: '1px solid rgba(255,255,255,0.02)',
            }}>
              <span style={{ color: 'var(--text-dim)', marginRight: '8px' }}>
                {entry.round > 0 ? `[R${entry.round}]` : '[!]'}
              </span>
              {entry.message}
            </div>
          ))}
        </div>
      </Panel>

      {/* Actions */}
      {!isOver ? (
        <Panel title={state.playerTurn ? 'Your Turn' : 'Enemy Turn'} accent={state.playerTurn ? 'var(--cyan)' : 'var(--red)'}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            <Button onClick={() => combatStore.performAction(CombatAction.Attack)} disabled={!state.playerTurn}>
              Attack
            </Button>
            <Button onClick={() => combatStore.performAction(CombatAction.HeavyAttack)} disabled={!state.playerTurn} variant="danger">
              Heavy Attack
            </Button>
            <Button onClick={() => combatStore.performAction(CombatAction.Defend)} disabled={!state.playerTurn} variant="ghost">
              Defend
            </Button>
            <Button onClick={() => combatStore.performAction(CombatAction.Repair)} disabled={!state.playerTurn} variant="success">
              Repair
            </Button>
            <Button onClick={() => combatStore.performAction(CombatAction.Flee)} disabled={!state.playerTurn} variant="amber">
              Flee
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            <span>Attack: {ship.weapons[0]?.energyCost ?? 0} energy</span>
            <span>Heavy: {Math.round((ship.weapons[0]?.energyCost ?? 0) * 1.5)} energy, +50% dmg, -20% acc</span>
            <span>Repair: 20 energy</span>
            <span>Defend: +15 shields/energy</span>
          </div>
        </Panel>
      ) : (
        <Panel title={state.result === 'victory' ? '🏆 Victory!' : state.result === 'fled' ? '🏃 Escaped!' : '💀 Defeat'} accent={state.result === 'defeat' ? 'var(--red)' : 'var(--green)'} glow>
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
        </Panel>
      )}
    </div>
  );
});
