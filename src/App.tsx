import { observer } from 'mobx-react-lite';
import { StoreContext, gameStore } from './stores/RootStore';
import { GameScreen } from './core/types';
import { SpaceBackground } from './ui/components/SpaceBackground';
import { WarpEffect } from './ui/components/WarpEffect';
import { HUD } from './ui/components/HUD';
import { Notifications } from './ui/components/Notifications';
import { MainMenu } from './ui/screens/MainMenu';
import { GalaxyView } from './ui/screens/GalaxyView';
import { SystemView } from './ui/screens/SystemView';
import { TradeView } from './ui/screens/TradeView';
import { CombatView } from './ui/screens/CombatView';
import { StoryView } from './ui/screens/StoryView';
import { ShipView } from './ui/screens/ShipView';
import { CodexView } from './ui/screens/CodexView';

const ScreenRouter = observer(function ScreenRouter() {
  const store = gameStore;

  switch (store.screen) {
    case GameScreen.MainMenu:
    case GameScreen.NewGame:
      return <MainMenu />;
    case GameScreen.Galaxy:
      return <GalaxyView />;
    case GameScreen.System:
      return <SystemView />;
    case GameScreen.Trade:
      return <TradeView />;
    case GameScreen.Combat:
      return <CombatView />;
    case GameScreen.Story:
      return <StoryView />;
    case GameScreen.Ship:
      return <ShipView />;
    case GameScreen.Codex:
      return <CodexView />;
    default:
      return <MainMenu />;
  }
});

const App = observer(function App() {
  const store = gameStore;
  const showHUD = store.screen !== GameScreen.MainMenu && store.screen !== GameScreen.NewGame;

  return (
    <StoreContext.Provider value={store}>
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', overflow: 'hidden' }}>
        <SpaceBackground intensity={store.screen === GameScreen.MainMenu ? 1.2 : 0.6} />
        <WarpEffect active={store.warping} />
        {showHUD && <HUD />}
        <Notifications />
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <ScreenRouter />
        </div>
      </div>
    </StoreContext.Provider>
  );
});

export default App;
