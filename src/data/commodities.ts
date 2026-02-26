import { type CommodityDef, CommodityCategory, FactionId } from '../core/types';

export const COMMODITIES: CommodityDef[] = [
  // Raw Materials
  {
    id: 'tritanium_ore',
    name: 'Tritanium Ore',
    category: CommodityCategory.RawMaterials,
    basePrice: 50,
    description: 'Dense metallic ore used in starship hull construction. Mined from asteroid belts and rocky worlds.',
    volatility: 0.2,
    legalIn: [],
    illegal: false,
  },
  {
    id: 'helium3',
    name: 'Helium-3',
    category: CommodityCategory.RawMaterials,
    basePrice: 80,
    description: 'Fusion fuel isotope harvested from gas giants. Essential for powering starship reactors.',
    volatility: 0.3,
    legalIn: [],
    illegal: false,
  },
  {
    id: 'crystal_lattice',
    name: 'Crystal Lattice',
    category: CommodityCategory.RawMaterials,
    basePrice: 120,
    description: 'Naturally forming crystalline structures with unique quantum properties. Used in advanced computing.',
    volatility: 0.4,
    legalIn: [],
    illegal: false,
  },
  // Technology
  {
    id: 'quantum_processors',
    name: 'Quantum Processors',
    category: CommodityCategory.Technology,
    basePrice: 300,
    description: 'State-of-the-art computing cores capable of parallel quantum calculations. Foundation specialty.',
    volatility: 0.3,
    legalIn: [],
    illegal: false,
  },
  {
    id: 'shield_emitters',
    name: 'Shield Emitters',
    category: CommodityCategory.Technology,
    basePrice: 250,
    description: 'Compact energy shield generators. Military-grade components in high demand across the galaxy.',
    volatility: 0.35,
    legalIn: [],
    illegal: false,
  },
  {
    id: 'nano_assemblers',
    name: 'Nano-Assemblers',
    category: CommodityCategory.Technology,
    basePrice: 400,
    description: 'Molecular-scale construction units. Can build or repair nearly anything given raw materials.',
    volatility: 0.4,
    legalIn: [],
    illegal: false,
  },
  {
    id: 'positronic_cores',
    name: 'Positronic Cores',
    category: CommodityCategory.Technology,
    basePrice: 600,
    description: 'The fundamental building blocks of artificial consciousness. Highly regulated by the Hegemony.',
    volatility: 0.5,
    legalIn: [],
    illegal: false,
  },
  // Luxury
  {
    id: 'nebula_wine',
    name: 'Nebula Wine',
    category: CommodityCategory.Luxury,
    basePrice: 200,
    description: 'Exquisite wine fermented in the micro-gravity of orbital stations. Each vintage is unique.',
    volatility: 0.5,
    legalIn: [],
    illegal: false,
  },
  {
    id: 'void_silk',
    name: 'Void Silk',
    category: CommodityCategory.Luxury,
    basePrice: 350,
    description: 'Shimmering fabric woven by zero-gravity arachnids. Prized by the galactic elite.',
    volatility: 0.6,
    legalIn: [],
    illegal: false,
  },
  {
    id: 'ancient_artifacts',
    name: 'Architect Artifacts',
    category: CommodityCategory.Luxury,
    basePrice: 800,
    description: 'Remnants of the vanished Architect civilization. Collectors pay fortunes for authentic pieces.',
    volatility: 0.7,
    legalIn: [],
    illegal: false,
  },
  // Contraband
  {
    id: 'combat_stims',
    name: 'Combat Stimulants',
    category: CommodityCategory.Contraband,
    basePrice: 150,
    description: 'Illegal performance-enhancing compounds. Massively boost reflexes but with severe side effects.',
    volatility: 0.6,
    legalIn: [FactionId.VoidRunners],
    illegal: true,
  },
  {
    id: 'neural_hackers',
    name: 'Neural Hack Kits',
    category: CommodityCategory.Contraband,
    basePrice: 500,
    description: 'Black market devices for bypassing neural security. Used by spies and criminals alike.',
    volatility: 0.7,
    legalIn: [FactionId.VoidRunners],
    illegal: true,
  },
];

export function getCommodityById(id: string): CommodityDef | undefined {
  return COMMODITIES.find(c => c.id === id);
}

export function getCommoditiesByCategory(cat: CommodityCategory): CommodityDef[] {
  return COMMODITIES.filter(c => c.category === cat);
}
