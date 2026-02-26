// ─── Galaxy Types ─────────────────────────────────────────────

export enum StarType {
  YellowDwarf = 'yellow_dwarf',
  RedGiant = 'red_giant',
  BlueGiant = 'blue_giant',
  WhiteDwarf = 'white_dwarf',
  NeutronStar = 'neutron_star',
  BinaryStar = 'binary_star',
  Pulsar = 'pulsar',
}

export enum PlanetType {
  Terrestrial = 'terrestrial',
  GasGiant = 'gas_giant',
  IceWorld = 'ice_world',
  Volcanic = 'volcanic',
  Ocean = 'ocean',
  Desert = 'desert',
  ArtificialHabitat = 'artificial_habitat',
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Planet {
  id: string;
  name: string;
  type: PlanetType;
  description: string;
  population: number;
  hasStation: boolean;
}

export interface StarSystem {
  id: string;
  name: string;
  starType: StarType;
  coordinates: Coordinates;
  planets: Planet[];
  description: string;
  faction: FactionId | null;
  dangerLevel: number;       // 0-10
  techLevel: number;         // 1-10
  connections: string[];     // ids of connected systems
  discovered: boolean;
  hasTradePost: boolean;
  hasShipyard: boolean;
  lore: string;
}

// ─── Economy Types ────────────────────────────────────────────

export enum CommodityCategory {
  RawMaterials = 'raw_materials',
  Technology = 'technology',
  Luxury = 'luxury',
  Contraband = 'contraband',
}

export interface CommodityDef {
  id: string;
  name: string;
  category: CommodityCategory;
  basePrice: number;
  description: string;
  volatility: number;        // 0-1, how much price fluctuates
  legalIn: FactionId[];      // empty = legal everywhere, specific = only those
  illegal: boolean;
}

export interface MarketListing {
  commodityId: string;
  price: number;
  supply: number;
  demand: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface MarketData {
  systemId: string;
  listings: MarketListing[];
  lastUpdated: number;       // game tick
}

export interface TradeRecord {
  commodityId: string;
  quantity: number;
  pricePerUnit: number;
  systemId: string;
  type: 'buy' | 'sell';
  tick: number;
}

// ─── Combat Types ─────────────────────────────────────────────

export enum CombatAction {
  Attack = 'attack',
  HeavyAttack = 'heavy_attack',
  Defend = 'defend',
  Repair = 'repair',
  SpecialAbility = 'special',
  Flee = 'flee',
}

export interface ShipWeapon {
  name: string;
  damage: number;
  energyCost: number;
  accuracy: number;          // 0-1
  type: 'kinetic' | 'energy' | 'missile';
}

export interface EnemyShip {
  id: string;
  name: string;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  energy: number;
  maxEnergy: number;
  weapons: ShipWeapon[];
  credits: number;           // loot
  xp: number;
  faction: FactionId | null;
  ai: 'aggressive' | 'defensive' | 'balanced' | 'cowardly';
  description: string;
}

export interface CombatLogEntry {
  round: number;
  actor: 'player' | 'enemy';
  action: string;
  damage?: number;
  message: string;
}

export interface CombatState {
  active: boolean;
  enemy: EnemyShip | null;
  round: number;
  log: CombatLogEntry[];
  playerTurn: boolean;
  result: 'pending' | 'victory' | 'defeat' | 'fled';
}

// ─── Story Types ──────────────────────────────────────────────

export enum QuestStatus {
  Locked = 'locked',
  Available = 'available',
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed',
}

export interface DialogueOption {
  id: string;
  text: string;
  requires?: {
    faction?: FactionId;
    minReputation?: number;
    item?: string;
    stat?: { key: string; min: number };
  };
  consequences?: StoryConsequence[];
  nextNodeId: string | null;  // null = end dialogue
}

export interface DialogueNode {
  id: string;
  speaker: string;
  portrait?: string;
  text: string;
  options: DialogueOption[];
}

export interface StoryConsequence {
  type: 'reputation' | 'credits' | 'item' | 'quest' | 'flag' | 'xp';
  target?: string;
  value: number | string | boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'travel' | 'trade' | 'combat' | 'dialogue' | 'explore';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  chapter: number;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: StoryConsequence[];
  isMain: boolean;
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  introDialogue: DialogueNode[];
  quests: string[];          // quest ids
  unlockCondition?: {
    chapter?: number;
    flag?: string;
    reputation?: { faction: FactionId; min: number };
  };
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'encounter' | 'discovery' | 'distress' | 'anomaly' | 'market' | 'story';
  choices: {
    text: string;
    consequences: StoryConsequence[];
    outcome: string;
  }[];
  condition?: {
    minDanger?: number;
    maxDanger?: number;
    faction?: FactionId;
    flag?: string;
  };
}

// ─── Player Types ─────────────────────────────────────────────

export enum ShipClass {
  Scout = 'scout',
  Trader = 'trader',
  Fighter = 'fighter',
  Explorer = 'explorer',
  Cruiser = 'cruiser',
  Dreadnought = 'dreadnought',
}

export interface ShipUpgrade {
  id: string;
  name: string;
  description: string;
  slot: 'weapon' | 'shield' | 'engine' | 'cargo' | 'special';
  cost: number;
  effect: { stat: string; value: number };
  requiredTech: number;
}

export interface Ship {
  name: string;
  class: ShipClass;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  energy: number;
  maxEnergy: number;
  fuel: number;
  maxFuel: number;
  cargoCapacity: number;
  weapons: ShipWeapon[];
  upgrades: string[];        // upgrade ids
  speed: number;             // affects travel time
}

export interface CargoItem {
  commodityId: string;
  quantity: number;
}

export interface Player {
  name: string;
  credits: number;
  xp: number;
  level: number;
  ship: Ship;
  cargo: CargoItem[];
  currentSystem: string;     // system id
  visitedSystems: string[];
  reputation: Record<FactionId, number>; // -100 to 100
  flags: Record<string, boolean | string | number>;
  stats: PlayerStats;
  tradeHistory: TradeRecord[];
}

export interface PlayerStats {
  systemsVisited: number;
  tradesCompleted: number;
  combatsWon: number;
  combatsLost: number;
  creditsEarned: number;
  creditsSpent: number;
  distanceTraveled: number;
  questsCompleted: number;
}

// ─── Faction Types ────────────────────────────────────────────

export enum FactionId {
  Foundation = 'foundation',
  Hegemony = 'hegemony',
  FreeTraders = 'free_traders',
  Synthetics = 'synthetics',
  VoidRunners = 'void_runners',
}

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  color: string;
  motto: string;
  leader: string;
  traits: string[];
  baseReputation: number;
}

export type ReputationTier = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';

// ─── Game Types ───────────────────────────────────────────────

export enum GameScreen {
  MainMenu = 'main_menu',
  Galaxy = 'galaxy',
  System = 'system',
  Trade = 'trade',
  Combat = 'combat',
  Story = 'story',
  Ship = 'ship',
  Codex = 'codex',
  NewGame = 'new_game',
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: number;
}

export interface SaveData {
  version: number;
  timestamp: number;
  player: Player;
  galaxy: {
    systems: StarSystem[];
    markets: MarketData[];
  };
  story: {
    currentChapter: number;
    quests: Quest[];
    flags: Record<string, boolean | string | number>;
    completedEvents: string[];
  };
  combat: CombatState;
  gameTick: number;
}

export interface CodexEntry {
  id: string;
  title: string;
  category: 'lore' | 'systems' | 'factions' | 'technology' | 'species';
  content: string;
  discovered: boolean;
}
