import { CombatAction, type CombatLogEntry, type CombatState, type EnemyShip, type Ship, type ShipWeapon, FactionId } from '../core/types';
import { randomChoice, randomFloat, randomInt, randomChance } from './RandomService';
import { STARTER_WEAPONS } from '../data/ships';

const ENEMY_TEMPLATES: Omit<EnemyShip, 'id'>[] = [
  {
    name: 'Void Runner Raider',
    hull: 60, maxHull: 60, shields: 20, maxShields: 20, energy: 40, maxEnergy: 40,
    weapons: [STARTER_WEAPONS.pulse_laser],
    credits: 150, xp: 40, faction: FactionId.VoidRunners,
    ai: 'aggressive',
    description: 'A fast, lightly armored pirate vessel. What they lack in firepower, they make up for in numbers.',
  },
  {
    name: 'Pirate Marauder',
    hull: 90, maxHull: 90, shields: 40, maxShields: 40, energy: 50, maxEnergy: 50,
    weapons: [STARTER_WEAPONS.railgun, STARTER_WEAPONS.pulse_laser],
    credits: 300, xp: 70, faction: FactionId.VoidRunners,
    ai: 'aggressive',
    description: 'A heavily armed pirate ship. The captain has clearly invested their ill-gotten gains in weaponry.',
  },
  {
    name: 'Hegemony Patrol Craft',
    hull: 100, maxHull: 100, shields: 60, maxShields: 60, energy: 60, maxEnergy: 60,
    weapons: [STARTER_WEAPONS.railgun, STARTER_WEAPONS.missile_pod],
    credits: 200, xp: 80, faction: FactionId.Hegemony,
    ai: 'balanced',
    description: 'Standard Hegemony military vessel. Well-armed and disciplined.',
  },
  {
    name: 'Rogue Synthetic Drone',
    hull: 50, maxHull: 50, shields: 80, maxShields: 80, energy: 70, maxEnergy: 70,
    weapons: [STARTER_WEAPONS.plasma_cannon],
    credits: 250, xp: 90, faction: FactionId.Synthetics,
    ai: 'defensive',
    description: 'An autonomous combat drone with powerful shields and energy weapons. Precise and relentless.',
  },
  {
    name: 'Scavenger Hulk',
    hull: 150, maxHull: 150, shields: 10, maxShields: 10, energy: 30, maxEnergy: 30,
    weapons: [STARTER_WEAPONS.gatling_turret, STARTER_WEAPONS.gatling_turret],
    credits: 100, xp: 50, faction: null,
    ai: 'cowardly',
    description: 'A cobbled-together ship made of salvaged parts. Tough hull but weak everything else.',
  },
  {
    name: 'Archive Guardian',
    hull: 200, maxHull: 200, shields: 150, maxShields: 150, energy: 100, maxEnergy: 100,
    weapons: [STARTER_WEAPONS.plasma_cannon, STARTER_WEAPONS.torpedo_launcher],
    credits: 500, xp: 200, faction: null,
    ai: 'balanced',
    description: 'An Architect automated defense platform. Ancient but devastatingly effective.',
  },
];

export function generateEnemy(dangerLevel: number, specificTemplate?: string): EnemyShip {
  let template: Omit<EnemyShip, 'id'>;

  if (specificTemplate) {
    template = ENEMY_TEMPLATES.find(t => t.name.toLowerCase().includes(specificTemplate.toLowerCase()))
      ?? randomChoice(ENEMY_TEMPLATES);
  } else {
    const suitable = ENEMY_TEMPLATES.filter(t => {
      const baseDifficulty = (t.maxHull + t.maxShields) / 50;
      return baseDifficulty <= dangerLevel + 2;
    });
    template = randomChoice(suitable.length > 0 ? suitable : [ENEMY_TEMPLATES[0]]);
  }

  const scaling = 0.8 + (dangerLevel / 10) * 0.6;

  return {
    ...template,
    id: crypto.randomUUID(),
    hull: Math.round(template.hull * scaling),
    maxHull: Math.round(template.maxHull * scaling),
    shields: Math.round(template.shields * scaling),
    maxShields: Math.round(template.maxShields * scaling),
    credits: Math.round(template.credits * scaling),
    xp: Math.round(template.xp * scaling),
  };
}

export function initCombat(enemy: EnemyShip): CombatState {
  return {
    active: true,
    enemy,
    round: 1,
    log: [{
      round: 0,
      actor: 'enemy',
      action: 'appear',
      message: `${enemy.name} engages! ${enemy.description}`,
    }],
    playerTurn: true,
    result: 'pending',
  };
}

function resolveAttack(
  weapon: ShipWeapon,
  targetShields: number,
  _targetHull: number,
  isHeavy: boolean
): { shieldDmg: number; hullDmg: number; hit: boolean } {
  const accuracy = isHeavy ? weapon.accuracy * 0.8 : weapon.accuracy;
  if (!randomChance(accuracy)) return { shieldDmg: 0, hullDmg: 0, hit: false };

  const baseDmg = isHeavy ? weapon.damage * 1.5 : weapon.damage;
  const variance = randomFloat(0.8, 1.2);
  let totalDmg = Math.round(baseDmg * variance);

  let shieldDmg = 0;
  let hullDmg = 0;

  if (targetShields > 0) {
    shieldDmg = Math.min(totalDmg, targetShields);
    totalDmg -= shieldDmg;
  }
  hullDmg = totalDmg;

  return { shieldDmg, hullDmg, hit: true };
}

export function executePlayerAction(
  action: CombatAction,
  ship: Ship,
  state: CombatState
): { state: CombatState; shipUpdates: Partial<Ship> } {
  if (!state.enemy || !state.active) return { state, shipUpdates: {} };

  const enemy = { ...state.enemy };
  const log: CombatLogEntry[] = [...state.log];
  const shipUpdates: Partial<Ship> = {};
  let playerEnergy = ship.energy;

  switch (action) {
    case CombatAction.Attack:
    case CombatAction.HeavyAttack: {
      const weapon = ship.weapons[0];
      if (!weapon) break;
      const cost = action === CombatAction.HeavyAttack ? weapon.energyCost * 1.5 : weapon.energyCost;
      if (playerEnergy < cost) {
        log.push({ round: state.round, actor: 'player', action: 'attack', message: 'Not enough energy to fire!' });
        break;
      }
      playerEnergy -= cost;
      const result = resolveAttack(weapon, enemy.shields, enemy.hull, action === CombatAction.HeavyAttack);
      if (result.hit) {
        enemy.shields = Math.max(0, enemy.shields - result.shieldDmg);
        enemy.hull = Math.max(0, enemy.hull - result.hullDmg);
        const totalDmg = result.shieldDmg + result.hullDmg;
        log.push({
          round: state.round, actor: 'player', action: action === CombatAction.HeavyAttack ? 'heavy_attack' : 'attack',
          damage: totalDmg,
          message: `Your ${weapon.name} hits for ${totalDmg} damage!${result.shieldDmg > 0 ? ` (${result.shieldDmg} absorbed by shields)` : ''}`,
        });
      } else {
        log.push({ round: state.round, actor: 'player', action: 'attack', message: `Your ${weapon.name} misses!` });
      }
      break;
    }
    case CombatAction.Defend: {
      const shieldRestore = Math.min(ship.maxShields - ship.shields, 15);
      shipUpdates.shields = ship.shields + shieldRestore;
      playerEnergy = Math.min(ship.maxEnergy, playerEnergy + 15);
      log.push({ round: state.round, actor: 'player', action: 'defend', message: `You raise shields and reroute power. Shields +${shieldRestore}, Energy +15.` });
      break;
    }
    case CombatAction.Repair: {
      if (playerEnergy < 20) {
        log.push({ round: state.round, actor: 'player', action: 'repair', message: 'Not enough energy for repairs!' });
        break;
      }
      playerEnergy -= 20;
      const hullRestore = Math.min(ship.maxHull - ship.hull, 25);
      shipUpdates.hull = ship.hull + hullRestore;
      log.push({ round: state.round, actor: 'player', action: 'repair', message: `Emergency repairs restore ${hullRestore} hull integrity.` });
      break;
    }
    case CombatAction.Flee: {
      const fleeChance = Math.min(0.8, ship.speed / 15);
      if (randomChance(fleeChance)) {
        log.push({ round: state.round, actor: 'player', action: 'flee', message: 'You engage emergency engines and escape!' });
        return {
          state: { ...state, log, active: false, result: 'fled', playerTurn: false },
          shipUpdates: { energy: playerEnergy },
        };
      } else {
        log.push({ round: state.round, actor: 'player', action: 'flee', message: 'Escape failed! The enemy cuts off your retreat.' });
      }
      break;
    }
  }

  shipUpdates.energy = playerEnergy;

  if (enemy.hull <= 0) {
    log.push({ round: state.round, actor: 'player', action: 'victory', message: `${enemy.name} is destroyed! Victory! +${enemy.credits} credits, +${enemy.xp} XP` });
    return {
      state: { ...state, enemy, log, active: false, result: 'victory', playerTurn: false },
      shipUpdates,
    };
  }

  // Enemy turn
  const enemyAction = getEnemyAction(enemy);
  const enemyWeapon = randomChoice(enemy.weapons);

  switch (enemyAction) {
    case 'attack': {
      if (enemyWeapon && enemy.energy >= enemyWeapon.energyCost) {
        enemy.energy -= enemyWeapon.energyCost;
        const currentShields = shipUpdates.shields ?? ship.shields;
        const currentHull = shipUpdates.hull ?? ship.hull;
        const result = resolveAttack(enemyWeapon, currentShields, currentHull, false);
        if (result.hit) {
          shipUpdates.shields = Math.max(0, (shipUpdates.shields ?? ship.shields) - result.shieldDmg);
          shipUpdates.hull = Math.max(0, (shipUpdates.hull ?? ship.hull) - result.hullDmg);
          const totalDmg = result.shieldDmg + result.hullDmg;
          log.push({ round: state.round, actor: 'enemy', action: 'attack', damage: totalDmg, message: `${enemy.name} fires ${enemyWeapon.name} for ${totalDmg} damage!` });
        } else {
          log.push({ round: state.round, actor: 'enemy', action: 'attack', message: `${enemy.name}'s ${enemyWeapon.name} misses!` });
        }
      } else {
        enemy.energy = Math.min(enemy.maxEnergy, enemy.energy + 20);
        log.push({ round: state.round, actor: 'enemy', action: 'recharge', message: `${enemy.name} reroutes power to weapons.` });
      }
      break;
    }
    case 'defend': {
      enemy.shields = Math.min(enemy.maxShields, enemy.shields + 10);
      enemy.energy = Math.min(enemy.maxEnergy, enemy.energy + 10);
      log.push({ round: state.round, actor: 'enemy', action: 'defend', message: `${enemy.name} reinforces shields and recharges.` });
      break;
    }
    case 'flee': {
      if (randomChance(0.3)) {
        log.push({ round: state.round, actor: 'enemy', action: 'flee', message: `${enemy.name} flees the battle! +${Math.round(enemy.credits * 0.3)} credits salvaged.` });
        return {
          state: { ...state, enemy, log, active: false, result: 'victory', playerTurn: false },
          shipUpdates,
        };
      }
      log.push({ round: state.round, actor: 'enemy', action: 'flee', message: `${enemy.name} tries to flee but fails!` });
      break;
    }
  }

  const playerHull = shipUpdates.hull ?? ship.hull;
  if (playerHull <= 0) {
    log.push({ round: state.round, actor: 'enemy', action: 'defeat', message: 'Your ship is destroyed! All is lost...' });
    return {
      state: { ...state, enemy, log, active: false, result: 'defeat', playerTurn: false },
      shipUpdates,
    };
  }

  return {
    state: {
      ...state,
      enemy,
      log,
      round: state.round + 1,
      playerTurn: true,
    },
    shipUpdates,
  };
}

function getEnemyAction(enemy: EnemyShip): 'attack' | 'defend' | 'flee' {
  const hullPercent = enemy.hull / enemy.maxHull;

  switch (enemy.ai) {
    case 'aggressive':
      if (hullPercent < 0.15) return randomChance(0.5) ? 'flee' : 'attack';
      return randomChance(0.85) ? 'attack' : 'defend';
    case 'defensive':
      if (hullPercent < 0.3) return randomChance(0.4) ? 'flee' : 'defend';
      return randomChance(0.5) ? 'attack' : 'defend';
    case 'cowardly':
      if (hullPercent < 0.5) return 'flee';
      return randomChance(0.6) ? 'attack' : 'defend';
    case 'balanced':
    default:
      if (hullPercent < 0.2) return randomChance(0.3) ? 'flee' : 'attack';
      if (enemy.shields < enemy.maxShields * 0.3) return randomChance(0.6) ? 'defend' : 'attack';
      return randomChance(0.7) ? 'attack' : 'defend';
  }
}

export function shouldEncounterEnemy(dangerLevel: number): boolean {
  return randomChance(dangerLevel / 20);
}

export function getRandomInt(_min: number, _max: number): number {
  return randomInt(_min, _max);
}
