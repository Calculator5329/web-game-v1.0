import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { GameScreen } from '../../core/types';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { FACTIONS } from '../../data/factions';

export const SystemView = observer(function SystemView() {
  const store = useStore();
  const { playerStore, galaxyStore } = store;
  const system = galaxyStore.getSystem(playerStore.player.currentSystem);

  if (!system) return null;

  const faction = system.faction ? FACTIONS[system.faction] : null;

  return (
    <div style={{ height: '100%', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700,
          color: 'var(--cyan)', letterSpacing: '3px',
        }}>
          {system.name}
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {system.starType.replace(/_/g, ' ').toUpperCase()} SYSTEM
          {faction && <> · <span style={{ color: faction.color }}>{faction.name}</span></>}
        </p>
      </div>

      <Panel title="System Overview">
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
          {system.description}
        </p>
        {system.lore && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5, fontStyle: 'italic', borderLeft: '2px solid var(--border)', paddingLeft: '12px' }}>
            {system.lore}
          </p>
        )}
      </Panel>

      {/* Planets */}
      <Panel title={`Planets (${system.planets.length})`} accent="var(--blue)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {system.planets.map(planet => (
            <div key={planet.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius)' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: planet.type === 'terrestrial' ? 'linear-gradient(135deg, #4caf50, #2196f3)'
                  : planet.type === 'gas_giant' ? 'linear-gradient(135deg, #ff9800, #f44336)'
                  : planet.type === 'ice_world' ? 'linear-gradient(135deg, #b3e5fc, #e1f5fe)'
                  : planet.type === 'ocean' ? 'linear-gradient(135deg, #0288d1, #01579b)'
                  : planet.type === 'desert' ? 'linear-gradient(135deg, #ffcc80, #e65100)'
                  : planet.type === 'volcanic' ? 'linear-gradient(135deg, #d32f2f, #ff6f00)'
                  : 'linear-gradient(135deg, #78909c, #455a64)',
              }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                  {planet.name}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: '8px' }}>
                    {planet.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {planet.description}
                </p>
                {planet.population > 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    Pop: {planet.population >= 1_000_000_000 ? `${(planet.population / 1_000_000_000).toFixed(1)}B` : `${(planet.population / 1_000_000).toFixed(0)}M`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Actions */}
      <Panel title="Actions" accent="var(--amber)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {system.hasTradePost && (
            <Button onClick={() => store.setScreen(GameScreen.Trade)} variant="amber" fullWidth>
              Trading Post
            </Button>
          )}
          {system.hasShipyard && (
            <Button onClick={() => store.setScreen(GameScreen.Ship)} fullWidth>
              Shipyard
            </Button>
          )}
          <Button onClick={() => store.playerStore.refuelShip()} variant="success" fullWidth
            disabled={playerStore.player.ship.fuel >= playerStore.player.ship.maxFuel}>
            Refuel ({Math.round((playerStore.player.ship.maxFuel - playerStore.player.ship.fuel) * 2)} CR)
          </Button>
          <Button onClick={() => store.playerStore.repairShip()} variant="success" fullWidth
            disabled={playerStore.player.ship.hull >= playerStore.player.ship.maxHull}>
            Repair ({Math.round((playerStore.player.ship.maxHull - playerStore.player.ship.hull) * 3)} CR)
          </Button>
          <Button onClick={() => store.setScreen(GameScreen.Galaxy)} variant="ghost" fullWidth>
            Galaxy Map
          </Button>
          <Button onClick={() => store.setScreen(GameScreen.Codex)} variant="ghost" fullWidth>
            Journal
          </Button>
        </div>
      </Panel>
    </div>
  );
});
