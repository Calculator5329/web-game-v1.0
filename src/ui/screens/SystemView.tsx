import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { GameScreen } from '../../core/types';
import { HoloPanel } from '../components/HoloPanel';
import { Button } from '../components/Button';
import { PlanetRenderer } from '../components/PlanetRenderer';
import { RadarWidget } from '../components/RadarWidget';
import { FACTIONS } from '../../data/factions';
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

export const SystemView = observer(function SystemView() {
  const store = useStore();
  const { playerStore, galaxyStore } = store;
  const system = galaxyStore.getSystem(playerStore.player.currentSystem);

  if (!system) return null;

  const faction = system.faction ? FACTIONS[system.faction] : null;
  const starColor = STAR_COLORS[system.starType] ?? '#ffffff';
  const connections = galaxyStore.getConnections(system.id);

  return (
    <div style={{ height: '100%', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header with star visualization */}
      <div style={{ textAlign: 'center', position: 'relative', paddingTop: '10px' }}>
        {/* Star glow */}
        <div style={{
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          width: '120px', height: '120px', borderRadius: '50%',
          background: `radial-gradient(circle, ${starColor}30, ${starColor}10 40%, transparent 70%)`,
          filter: `blur(20px)`,
          animation: 'pulse-glow 4s ease infinite',
        }} />
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700,
          color: starColor, letterSpacing: '3px', position: 'relative',
          textShadow: `0 0 30px ${starColor}60`,
        }}>
          {system.name}
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', position: 'relative' }}>
          {system.starType.replace(/_/g, ' ').toUpperCase()} SYSTEM
          {faction && <> · <span style={{ color: faction.color }}>{faction.name}</span></>}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <HoloPanel title="System Overview" scanline corners>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              {system.description}
            </p>
            {system.lore && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5, fontStyle: 'italic', borderLeft: `2px solid ${starColor}44`, paddingLeft: '12px' }}>
                {system.lore}
              </p>
            )}
          </HoloPanel>

          <HoloPanel title={`Celestial Bodies (${system.planets.length})`} accent="var(--blue)" corners>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', padding: '8px 0' }}>
              {system.planets.map(planet => (
                <div key={planet.id} style={{ textAlign: 'center', maxWidth: '200px' }}>
                  <PlanetRenderer type={planet.type} size={60} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.5px', marginTop: '4px' }}>
                    {planet.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {planet.type.replace(/_/g, ' ')}
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginTop: '4px' }}>
                    {planet.description}
                  </p>
                  {planet.population > 0 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Pop: {planet.population >= 1_000_000_000 ? `${(planet.population / 1_000_000_000).toFixed(1)}B` : `${(planet.population / 1_000_000).toFixed(0)}M`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </HoloPanel>
        </div>

        {/* Right sidebar */}
        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <RadarWidget currentSystem={system} connections={connections} size={160} />

          <HoloPanel title="Actions" accent="var(--amber)" style={{ width: '100%' }} corners>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {system.hasTradePost && (
                <Button onClick={() => store.setScreen(GameScreen.Trade)} variant="amber" fullWidth size="sm">Trade</Button>
              )}
              {system.hasShipyard && (
                <Button onClick={() => store.setScreen(GameScreen.Ship)} fullWidth size="sm">Shipyard</Button>
              )}
              <Button onClick={() => store.playerStore.refuelShip()} variant="success" fullWidth size="sm"
                disabled={playerStore.player.ship.fuel >= playerStore.player.ship.maxFuel}>
                Refuel
              </Button>
              <Button onClick={() => store.playerStore.repairShip()} variant="success" fullWidth size="sm"
                disabled={playerStore.player.ship.hull >= playerStore.player.ship.maxHull}>
                Repair
              </Button>
              <Button onClick={() => store.setScreen(GameScreen.Galaxy)} variant="ghost" fullWidth size="sm">Galaxy Map</Button>
            </div>
          </HoloPanel>
        </div>
      </div>
    </div>
  );
});
