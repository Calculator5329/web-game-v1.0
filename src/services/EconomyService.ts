import type { MarketData, MarketListing, StarSystem, TradeRecord, CargoItem } from '../core/types';
import { COMMODITIES } from '../data/commodities';
import { randomFloat, randomChoice } from './RandomService';

function getSystemPriceModifier(system: StarSystem, commodityId: string): number {
  let mod = 1.0;

  if (system.techLevel >= 8 && ['quantum_processors', 'nano_assemblers', 'positronic_cores'].includes(commodityId)) {
    mod *= 0.7;
  }
  if (system.techLevel <= 4 && ['quantum_processors', 'nano_assemblers'].includes(commodityId)) {
    mod *= 1.5;
  }

  if (system.dangerLevel >= 6 && ['combat_stims', 'neural_hackers', 'shield_emitters'].includes(commodityId)) {
    mod *= 0.8;
  }
  if (system.dangerLevel <= 2 && ['nebula_wine', 'void_silk'].includes(commodityId)) {
    mod *= 1.3;
  }

  if (['tritanium_ore', 'helium3', 'crystal_lattice'].includes(commodityId)) {
    mod *= system.techLevel <= 5 ? 0.6 : 1.2;
  }

  return mod;
}

export function generateMarket(system: StarSystem): MarketData {
  const listings: MarketListing[] = COMMODITIES
    .filter(c => {
      if (c.illegal && system.faction && !c.legalIn.includes(system.faction)) {
        return Math.random() < 0.2;
      }
      return true;
    })
    .map(commodity => {
      const modifier = getSystemPriceModifier(system, commodity.id);
      const volatilityRange = commodity.basePrice * commodity.volatility;
      const price = Math.round(
        commodity.basePrice * modifier + randomFloat(-volatilityRange, volatilityRange)
      );

      const supply = Math.max(0, Math.round(randomFloat(5, 50) * (modifier < 1 ? 1.5 : 0.7)));
      const demand = Math.max(0, Math.round(randomFloat(5, 50) * (modifier > 1 ? 1.5 : 0.7)));

      const trends: Array<'rising' | 'falling' | 'stable'> = ['rising', 'falling', 'stable'];
      const trend = randomChoice(trends);

      return {
        commodityId: commodity.id,
        price: Math.max(1, price),
        supply,
        demand,
        trend,
      };
    });

  return {
    systemId: system.id,
    listings,
    lastUpdated: 0,
  };
}

export function updateMarketPrices(market: MarketData, tick: number): MarketData {
  const updatedListings = market.listings.map(listing => {
    const commodity = COMMODITIES.find(c => c.id === listing.commodityId);
    if (!commodity) return listing;

    let priceChange = 0;
    if (listing.trend === 'rising') priceChange = randomFloat(0, commodity.basePrice * 0.05);
    else if (listing.trend === 'falling') priceChange = randomFloat(-commodity.basePrice * 0.05, 0);
    else priceChange = randomFloat(-commodity.basePrice * 0.02, commodity.basePrice * 0.02);

    const supplyChange = listing.supply > 0 ? Math.round(randomFloat(-3, 5)) : Math.round(randomFloat(0, 5));
    const demandChange = Math.round(randomFloat(-3, 3));

    const newTrend: 'rising' | 'falling' | 'stable' =
      Math.random() < 0.15 ? randomChoice(['rising', 'falling', 'stable'] as const) : listing.trend;

    return {
      ...listing,
      price: Math.max(1, Math.round(listing.price + priceChange)),
      supply: Math.max(0, listing.supply + supplyChange),
      demand: Math.max(0, listing.demand + demandChange),
      trend: newTrend,
    };
  });

  return { ...market, listings: updatedListings, lastUpdated: tick };
}

export function calculateBuyPrice(listing: MarketListing, quantity: number): number {
  const surcharge = listing.supply < 10 ? 1.1 : 1.0;
  return Math.round(listing.price * quantity * surcharge);
}

export function calculateSellPrice(listing: MarketListing, quantity: number): number {
  const discount = listing.demand < 10 ? 0.85 : 0.95;
  return Math.round(listing.price * quantity * discount);
}

export function canBuy(
  credits: number,
  cargo: CargoItem[],
  cargoCapacity: number,
  listing: MarketListing,
  quantity: number
): { ok: boolean; reason?: string } {
  const totalCargo = cargo.reduce((sum, c) => sum + c.quantity, 0);
  if (totalCargo + quantity > cargoCapacity) {
    return { ok: false, reason: 'Not enough cargo space' };
  }
  const cost = calculateBuyPrice(listing, quantity);
  if (cost > credits) {
    return { ok: false, reason: 'Not enough credits' };
  }
  if (quantity > listing.supply) {
    return { ok: false, reason: 'Not enough supply' };
  }
  return { ok: true };
}

export function executeBuy(
  cargo: CargoItem[],
  commodityId: string,
  quantity: number
): CargoItem[] {
  const existing = cargo.find(c => c.commodityId === commodityId);
  if (existing) {
    return cargo.map(c =>
      c.commodityId === commodityId ? { ...c, quantity: c.quantity + quantity } : c
    );
  }
  return [...cargo, { commodityId, quantity }];
}

export function executeSell(cargo: CargoItem[], commodityId: string, quantity: number): CargoItem[] {
  return cargo
    .map(c =>
      c.commodityId === commodityId ? { ...c, quantity: c.quantity - quantity } : c
    )
    .filter(c => c.quantity > 0);
}

export function createTradeRecord(
  commodityId: string,
  quantity: number,
  pricePerUnit: number,
  systemId: string,
  type: 'buy' | 'sell',
  tick: number
): TradeRecord {
  return { commodityId, quantity, pricePerUnit, systemId, type, tick };
}
