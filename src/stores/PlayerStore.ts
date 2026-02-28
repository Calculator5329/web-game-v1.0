import { makeAutoObservable } from 'mobx';
import type { Player, Ship, CargoItem, TradeRecord, ShipUpgrade } from '../core/types';
import { FactionId, ShipClass } from '../core/types';
import { STARTER_SHIPS } from '../data/ships';

function createDefaultPlayer(name: string, shipClass: ShipClass): Player {
  const ship = { ...STARTER_SHIPS[shipClass], weapons: [...STARTER_SHIPS[shipClass].weapons] };
  return {
    name,
    credits: 1000,
    xp: 0,
    level: 1,
    ship,
    cargo: [],
    currentSystem: 'nexus_prime',
    visitedSystems: ['nexus_prime'],
    reputation: {
      [FactionId.Foundation]: 10,
      [FactionId.Hegemony]: -5,
      [FactionId.FreeTraders]: 15,
      [FactionId.Synthetics]: 0,
      [FactionId.VoidRunners]: -20,
    },
    flags: {},
    stats: {
      systemsVisited: 1,
      tradesCompleted: 0,
      combatsWon: 0,
      combatsLost: 0,
      creditsEarned: 0,
      creditsSpent: 0,
      distanceTraveled: 0,
      questsCompleted: 0,
    },
    tradeHistory: [],
  };
}

export class PlayerStore {
  player: Player = createDefaultPlayer('Captain', ShipClass.Scout);

  constructor() {
    makeAutoObservable(this);
  }

  init(name: string, shipClass: ShipClass) {
    this.player = createDefaultPlayer(name, shipClass);
  }

  loadPlayer(player: Player) {
    this.player = player;
  }

  get currentCargoUsed(): number {
    return this.player.cargo.reduce((sum, c) => sum + c.quantity, 0);
  }

  get cargoFree(): number {
    return this.player.ship.cargoCapacity - this.currentCargoUsed;
  }

  get xpForNextLevel(): number {
    return this.player.level * 100;
  }

  addCredits(amount: number) {
    this.player.credits += amount;
    if (amount > 0) this.player.stats.creditsEarned += amount;
    else this.player.stats.creditsSpent += Math.abs(amount);
  }

  addXp(amount: number) {
    this.player.xp += amount;
    while (this.player.xp >= this.xpForNextLevel) {
      this.player.xp -= this.xpForNextLevel;
      this.player.level++;
    }
  }

  setCurrentSystem(systemId: string) {
    this.player.currentSystem = systemId;
    if (!this.player.visitedSystems.includes(systemId)) {
      this.player.visitedSystems.push(systemId);
      this.player.stats.systemsVisited++;
    }
  }

  updateCargo(cargo: CargoItem[]) {
    this.player.cargo = cargo;
  }

  addTradeRecord(record: TradeRecord) {
    this.player.tradeHistory.push(record);
    this.player.stats.tradesCompleted++;
  }

  updateShip(updates: Partial<Ship>) {
    Object.assign(this.player.ship, updates);
  }

  addReputation(faction: FactionId, amount: number) {
    this.player.reputation[faction] = Math.max(-100, Math.min(100,
      this.player.reputation[faction] + amount
    ));
  }

  setFlag(key: string, value: boolean | string | number) {
    this.player.flags[key] = value;
  }

  getFlag(key: string): boolean | string | number | undefined {
    return this.player.flags[key];
  }

  hasFlag(key: string): boolean {
    return key in this.player.flags && !!this.player.flags[key];
  }

  installUpgrade(upgrade: ShipUpgrade) {
    if (this.player.credits < upgrade.cost) return false;
    this.addCredits(-upgrade.cost);
    this.player.ship.upgrades.push(upgrade.id);

    const stat = upgrade.effect.stat;
    const val = upgrade.effect.value;
    const ship = this.player.ship;

    if (stat === 'maxShields') { ship.maxShields += val; ship.shields += val; }
    else if (stat === 'maxHull') { ship.maxHull += val; ship.hull += val; }
    else if (stat === 'speed') { ship.speed += val; }
    else if (stat === 'cargoCapacity') { ship.cargoCapacity += val; }
    else if (stat === 'maxEnergy') { ship.maxEnergy += val; ship.energy += val; }

    return true;
  }

  refuelShip() {
    const fuelNeeded = this.player.ship.maxFuel - this.player.ship.fuel;
    const cost = Math.round(fuelNeeded * 2);
    if (this.player.credits >= cost) {
      this.addCredits(-cost);
      this.player.ship.fuel = this.player.ship.maxFuel;
      return true;
    }
    return false;
  }

  repairShip() {
    const repairNeeded = this.player.ship.maxHull - this.player.ship.hull;
    const cost = Math.round(repairNeeded * 3);
    if (this.player.credits >= cost && repairNeeded > 0) {
      this.addCredits(-cost);
      this.player.ship.hull = this.player.ship.maxHull;
      this.player.ship.shields = this.player.ship.maxShields;
      return true;
    }
    return false;
  }

  recordCombatWin() { this.player.stats.combatsWon++; }
  recordCombatLoss() { this.player.stats.combatsLost++; }
  recordQuestComplete() { this.player.stats.questsCompleted++; }
  addDistance(d: number) { this.player.stats.distanceTraveled += d; }
}
