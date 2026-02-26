import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { SHIP_UPGRADES } from '../../data/ships';
import { FACTIONS, getReputationTier, getReputationColor } from '../../data/factions';
import { FactionId } from '../../core/types';

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ width: '80px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.65rem' }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px' }} />
      </div>
      <span style={{ width: '65px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color }}>{value}/{max}</span>
    </div>
  );
}

export const ShipView = observer(function ShipView() {
  const store = useStore();
  const { playerStore, galaxyStore } = store;
  const ship = playerStore.player.ship;
  const player = playerStore.player;
  const system = galaxyStore.getSystem(player.currentSystem);

  const availableUpgrades = SHIP_UPGRADES.filter(u =>
    !ship.upgrades.includes(u.id) && (system?.techLevel ?? 0) >= u.requiredTech
  );

  return (
    <div style={{ height: '100%', padding: '20px', overflowY: 'auto', display: 'flex', gap: '16px' }}>
      {/* Ship info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Panel title="Ship Status" accent="var(--cyan)" glow>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cyan)', letterSpacing: '2px' }}>
                {ship.name}
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                {ship.class} class
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Speed: <span style={{ color: 'var(--green)' }}>{ship.speed}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Cargo: <span style={{ color: 'var(--amber)' }}>{playerStore.currentCargoUsed}/{ship.cargoCapacity}</span>
              </div>
            </div>
          </div>

          <StatBar label="Hull" value={ship.hull} max={ship.maxHull} color="var(--green)" />
          <StatBar label="Shields" value={ship.shields} max={ship.maxShields} color="var(--cyan)" />
          <StatBar label="Energy" value={ship.energy} max={ship.maxEnergy} color="var(--amber)" />
          <StatBar label="Fuel" value={ship.fuel} max={ship.maxFuel} color="var(--purple)" />

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <Button variant="success" size="sm" onClick={() => { if (playerStore.refuelShip()) store.notify('Ship refueled!', 'success'); }}
              disabled={ship.fuel >= ship.maxFuel}>
              Refuel
            </Button>
            <Button variant="success" size="sm" onClick={() => { if (playerStore.repairShip()) store.notify('Ship repaired!', 'success'); }}
              disabled={ship.hull >= ship.maxHull}>
              Repair
            </Button>
          </div>
        </Panel>

        {/* Weapons */}
        <Panel title="Weapons" accent="var(--red)">
          {ship.weapons.map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{w.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '8px' }}>{w.type}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--red)' }}>DMG:{w.damage}</span>
                <span style={{ color: 'var(--amber)' }}>NRG:{w.energyCost}</span>
                <span style={{ color: 'var(--green)' }}>ACC:{Math.round(w.accuracy * 100)}%</span>
              </div>
            </div>
          ))}
        </Panel>

        {/* Installed Upgrades */}
        {ship.upgrades.length > 0 && (
          <Panel title="Installed Upgrades" accent="var(--blue)">
            {ship.upgrades.map(uid => {
              const up = SHIP_UPGRADES.find(u => u.id === uid);
              if (!up) return null;
              return (
                <div key={uid} style={{ padding: '4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--blue)' }}>{up.name}</span> — {up.description}
                </div>
              );
            })}
          </Panel>
        )}
      </div>

      {/* Right column */}
      <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Player stats */}
        <Panel title="Captain Profile" accent="var(--purple)">
          <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--purple)', letterSpacing: '1px' }}>{player.name}</span>
            <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>Level {player.level}</span>
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            XP: {player.xp}/{playerStore.xpForNextLevel}
          </div>
          <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.7rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Systems visited:</span><span>{player.stats.systemsVisited}</span>
            <span style={{ color: 'var(--text-dim)' }}>Trades done:</span><span>{player.stats.tradesCompleted}</span>
            <span style={{ color: 'var(--text-dim)' }}>Combats won:</span><span>{player.stats.combatsWon}</span>
            <span style={{ color: 'var(--text-dim)' }}>Quests done:</span><span>{player.stats.questsCompleted}</span>
            <span style={{ color: 'var(--text-dim)' }}>Credits earned:</span><span style={{ color: 'var(--gold)' }}>{player.stats.creditsEarned.toLocaleString()}</span>
          </div>
        </Panel>

        {/* Faction reputation */}
        <Panel title="Faction Standing" accent="var(--amber)">
          {Object.values(FactionId).map(fid => {
            const rep = player.reputation[fid];
            const faction = FACTIONS[fid];
            return (
              <div key={fid} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ color: faction.color }}>{faction.name}</span>
                  <span style={{ color: getReputationColor(rep), fontFamily: 'var(--font-mono)' }}>
                    {getReputationTier(rep)} ({rep > 0 ? '+' : ''}{rep})
                  </span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${(rep + 100) / 2}%`,
                    background: getReputationColor(rep),
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            );
          })}
        </Panel>

        {/* Available upgrades */}
        {system?.hasShipyard && availableUpgrades.length > 0 && (
          <Panel title="Shipyard — Upgrades" accent="var(--green)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {availableUpgrades.slice(0, 6).map(up => (
                <div key={up.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                      {up.name} <span style={{ color: 'var(--text-dim)', fontSize: '0.6rem' }}>({up.slot})</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{up.description}</div>
                  </div>
                  <Button size="sm" variant={player.credits >= up.cost ? 'success' : 'ghost'}
                    disabled={player.credits < up.cost}
                    onClick={() => { if (playerStore.installUpgrade(up)) store.notify(`Installed ${up.name}!`, 'success'); }}
                  >
                    {up.cost} CR
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
});
