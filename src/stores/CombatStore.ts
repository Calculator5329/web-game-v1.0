import { makeAutoObservable } from 'mobx';
import { type CombatState, type EnemyShip, CombatAction } from '../core/types';
import { initCombat, executePlayerAction } from '../services/CombatService';
import type { PlayerStore } from './PlayerStore';

export class CombatStore {
  state: CombatState = {
    active: false,
    enemy: null,
    round: 0,
    log: [],
    playerTurn: true,
    result: 'pending',
  };

  private playerStore: PlayerStore;

  constructor(playerStore: PlayerStore) {
    makeAutoObservable(this);
    this.playerStore = playerStore;
  }

  loadState(state: CombatState) {
    this.state = state;
  }

  startCombat(enemy: EnemyShip) {
    this.state = initCombat(enemy);
  }

  performAction(action: CombatAction) {
    if (!this.state.active || !this.state.playerTurn) return;

    const { state: newState, shipUpdates } = executePlayerAction(
      action,
      this.playerStore.player.ship,
      this.state
    );

    this.state = newState;
    this.playerStore.updateShip(shipUpdates);

    if (newState.result === 'victory' && newState.enemy) {
      this.playerStore.addCredits(newState.enemy.credits);
      this.playerStore.addXp(newState.enemy.xp);
      this.playerStore.recordCombatWin();
    } else if (newState.result === 'defeat') {
      this.playerStore.recordCombatLoss();
    }
  }

  endCombat() {
    this.state = {
      active: false,
      enemy: null,
      round: 0,
      log: [],
      playerTurn: true,
      result: 'pending',
    };
  }

  get isActive(): boolean {
    return this.state.active;
  }

  get isPlayerTurn(): boolean {
    return this.state.playerTurn;
  }

  get combatResult(): string {
    return this.state.result;
  }

  get lastLogEntries(): typeof this.state.log {
    return this.state.log.slice(-6);
  }
}
