import { makeAutoObservable, runInAction } from 'mobx';
import { GameScreen, type Notification, type SaveData, ShipClass } from '../core/types';
import { PlayerStore } from './PlayerStore';
import { GalaxyStore } from './GalaxyStore';
import { CombatStore } from './CombatStore';
import { StoryStore } from './StoryStore';
import { saveGame, loadGame, hasSave } from '../services/SaveService';
import { generateEnemy, shouldEncounterEnemy } from '../services/CombatService';
import { getDistance } from '../data/galaxy';
import { generateId } from '../services/RandomService';

export class GameStore {
  screen: GameScreen = GameScreen.MainMenu;
  gameTick: number = 0;
  notifications: Notification[] = [];
  hasSaveGame: boolean = false;
  isLoading: boolean = false;
  eventOutcome: string | null = null;
  warping: boolean = false;

  playerStore: PlayerStore;
  galaxyStore: GalaxyStore;
  combatStore: CombatStore;
  storyStore: StoryStore;

  constructor() {
    this.playerStore = new PlayerStore();
    this.galaxyStore = new GalaxyStore();
    this.combatStore = new CombatStore(this.playerStore);
    this.storyStore = new StoryStore(this.playerStore);
    makeAutoObservable(this);

    this.checkForSave();
  }

  async checkForSave() {
    this.hasSaveGame = await hasSave();
  }

  notify(message: string, type: Notification['type'] = 'info') {
    const n: Notification = { id: generateId(), message, type, timestamp: Date.now() };
    this.notifications.push(n);
    setTimeout(() => runInAction(() => {
      this.notifications = this.notifications.filter(x => x.id !== n.id);
    }), 4000);
  }

  setScreen(screen: GameScreen) {
    this.screen = screen;
  }

  startNewGame(playerName: string, shipClass: ShipClass) {
    this.playerStore.init(playerName, shipClass);
    this.galaxyStore.init();
    this.storyStore.init();
    this.combatStore.endCombat();
    this.gameTick = 0;
    this.screen = GameScreen.Story;
    this.storyStore.startChapterDialogue();
    this.notify('Welcome to the galaxy, Captain. Your journey begins.', 'success');
  }

  async loadSavedGame() {
    this.isLoading = true;
    try {
      const data = await loadGame();
      if (data) {
        runInAction(() => {
          this.playerStore.loadPlayer(data.player);
          this.galaxyStore.loadState(data.galaxy.systems, data.galaxy.markets);
          this.storyStore.loadState(data.story);
          this.combatStore.loadState(data.combat);
          this.gameTick = data.gameTick;
          this.screen = GameScreen.Galaxy;
          this.notify('Game loaded successfully.', 'success');
        });
      } else {
        runInAction(() => this.notify('No save data found.', 'warning'));
      }
    } catch {
      runInAction(() => this.notify('Failed to load game.', 'danger'));
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async saveCurrentGame() {
    const data: SaveData = {
      version: 1,
      timestamp: Date.now(),
      player: this.playerStore.player,
      galaxy: {
        systems: this.galaxyStore.systems,
        markets: this.galaxyStore.marketsArray,
      },
      story: {
        currentChapter: this.storyStore.currentChapter,
        quests: this.storyStore.quests,
        flags: this.storyStore.flags,
        completedEvents: this.storyStore.completedEvents,
      },
      combat: this.combatStore.state,
      gameTick: this.gameTick,
    };
    try {
      await saveGame(data);
      this.hasSaveGame = true;
      this.notify('Game saved.', 'success');
    } catch {
      this.notify('Failed to save game.', 'danger');
    }
  }

  travelToSystem(systemId: string) {
    const from = this.galaxyStore.getSystem(this.playerStore.player.currentSystem);
    const to = this.galaxyStore.getSystem(systemId);
    if (!from || !to) return;

    if (!from.connections.includes(systemId)) {
      this.notify('No route to that system.', 'warning');
      return;
    }

    const fuelCost = this.galaxyStore.getTravelCost(from.id, to.id);
    if (this.playerStore.player.ship.fuel < fuelCost) {
      this.notify('Not enough fuel for this journey.', 'warning');
      return;
    }

    this.playerStore.updateShip({ fuel: this.playerStore.player.ship.fuel - fuelCost });
    const dist = getDistance(from.coordinates, to.coordinates);
    this.playerStore.addDistance(dist);

    this.warping = true;
    const targetId = systemId;
    const targetDanger = to.dangerLevel;
    const targetName = to.name;

    setTimeout(() => runInAction(() => {
      this.warping = false;
      this.playerStore.setCurrentSystem(targetId);
      this.galaxyStore.discoverConnectedSystems(targetId);
      this.gameTick++;
      this.galaxyStore.tickMarkets(this.gameTick);
      this.storyStore.onSystemVisited(targetId);

      const event = this.storyStore.tryRandomEvent(targetDanger);
      if (event) {
        this.eventOutcome = null;
        this.screen = GameScreen.Story;
        this.notify(`Event: ${event.title}`, 'info');
        return;
      }

      if (shouldEncounterEnemy(targetDanger)) {
        const enemy = generateEnemy(targetDanger);
        this.combatStore.startCombat(enemy);
        this.screen = GameScreen.Combat;
        this.notify(`Hostile contact: ${enemy.name}!`, 'danger');
        return;
      }

      this.notify(`Arrived at ${targetName}. Fuel -${fuelCost}.`, 'info');
      this.saveCurrentGame();
    }), 1300);
  }

  resolveEventChoice(choiceIndex: number) {
    const outcome = this.storyStore.resolveEvent(choiceIndex);
    if (outcome) {
      this.eventOutcome = outcome;
    }
  }

  dismissEventOutcome() {
    this.eventOutcome = null;
    this.screen = GameScreen.Galaxy;
  }

  finishCombat() {
    if (this.combatStore.state.result === 'defeat') {
      this.playerStore.updateShip({
        hull: Math.round(this.playerStore.player.ship.maxHull * 0.3),
        shields: 0,
      });
      this.playerStore.addCredits(-Math.round(this.playerStore.player.credits * 0.2));
      this.notify('Your ship was disabled. Emergency systems saved you, but at a cost.', 'danger');
    } else if (this.combatStore.state.result === 'victory') {
      this.storyStore.onCombatWon();
    }
    this.combatStore.endCombat();
    this.screen = GameScreen.Galaxy;
    this.saveCurrentGame();
  }
}
