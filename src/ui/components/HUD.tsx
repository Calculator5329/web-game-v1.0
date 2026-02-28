import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { GameScreen } from '../../core/types';
import { FACTIONS } from '../../data/factions';

const hudStyle: React.CSSProperties = {
  width: '100%',
  height: '56px',
  minHeight: '56px',
  background: 'linear-gradient(180deg, #0c1630 0%, #080e24 100%)',
  borderBottom: '1px solid var(--border-bright)',
  boxShadow: '0 2px 16px rgba(0,0,0,0.6), 0 1px 0 rgba(0,240,255,0.1) inset',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  zIndex: 100,
  position: 'relative',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  flexShrink: 0,
};

const navBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-display)',
  fontSize: '0.75rem',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  padding: '8px 16px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  borderRadius: 'var(--radius)',
};

const activeNavBtn: React.CSSProperties = {
  ...navBtn,
  color: 'var(--cyan)',
  borderColor: 'var(--border-bright)',
  background: 'rgba(0,240,255,0.1)',
  boxShadow: '0 0 8px rgba(0,240,255,0.15)',
};

export const HUD = observer(function HUD() {
  const store = useStore();
  const player = store.playerStore.player;
  const system = store.galaxyStore.getSystem(player.currentSystem);
  const faction = system?.faction ? FACTIONS[system.faction] : null;

  const navItems: { label: string; screen: GameScreen }[] = [
    { label: 'Galaxy', screen: GameScreen.Galaxy },
    { label: 'System', screen: GameScreen.System },
    { label: 'Ship', screen: GameScreen.Ship },
    { label: 'Journal', screen: GameScreen.Codex },
  ];

  if (system?.hasTradePost) {
    navItems.splice(2, 0, { label: 'Trade', screen: GameScreen.Trade });
  }

  return (
    <div style={hudStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--cyan)', letterSpacing: '2px', textShadow: '0 0 10px rgba(0,240,255,0.4)' }}>
          NEXUS
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {navItems.map(item => (
            <button
              key={item.screen}
              onClick={() => store.setScreen(item.screen)}
              style={store.screen === item.screen ? activeNavBtn : navBtn}
              onMouseEnter={e => { if (store.screen !== item.screen) { e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.background = 'rgba(0,240,255,0.05)'; } }}
              onMouseLeave={e => { if (store.screen !== item.screen) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-dim)' }}>SYS:</span>
          <span style={{ color: faction?.color ?? 'var(--text-primary)' }}>{system?.name ?? '???'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-dim)' }}>CR:</span>
          <span style={{ color: 'var(--gold)' }}>{player.credits.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-dim)' }}>FUEL:</span>
          <span style={{ color: player.ship.fuel < player.ship.maxFuel * 0.2 ? 'var(--red)' : 'var(--green)' }}>
            {player.ship.fuel}/{player.ship.maxFuel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-dim)' }}>HULL:</span>
          <span style={{ color: player.ship.hull < player.ship.maxHull * 0.3 ? 'var(--red)' : 'var(--cyan)' }}>
            {player.ship.hull}/{player.ship.maxHull}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-dim)' }}>LVL:</span>
          <span style={{ color: 'var(--purple)' }}>{player.level}</span>
        </div>
        <button
          onClick={() => store.saveCurrentGame()}
          style={{ ...navBtn, color: 'var(--green)', borderColor: 'rgba(0,230,118,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'rgba(0,230,118,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,230,118,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        >
          Save
        </button>
      </div>
    </div>
  );
});
