import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { GameScreen } from '../../core/types';
import { FACTIONS } from '../../data/factions';

const hudStyle: React.CSSProperties = {
  width: '100%',
  height: '54px',
  minHeight: '54px',
  background: 'linear-gradient(180deg, #070d1f, #0a1128)',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  zIndex: 100,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  flexShrink: 0,
};

const navBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid transparent',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-display)',
  fontSize: '0.65rem',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  padding: '6px 14px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  borderRadius: 'var(--radius)',
};

const activeNavBtn: React.CSSProperties = {
  ...navBtn,
  color: 'var(--cyan)',
  borderColor: 'var(--border-bright)',
  background: 'rgba(0,240,255,0.05)',
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
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: '2px' }}>
          NEXUS
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {navItems.map(item => (
            <button
              key={item.screen}
              onClick={() => store.setScreen(item.screen)}
              style={store.screen === item.screen ? activeNavBtn : navBtn}
              onMouseEnter={e => { if (store.screen !== item.screen) { e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
              onMouseLeave={e => { if (store.screen !== item.screen) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; } }}
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
          style={{ ...navBtn, color: 'var(--green)', fontSize: '0.6rem' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; }}
        >
          Save
        </button>
      </div>
    </div>
  );
});
