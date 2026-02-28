import { makeAutoObservable } from 'mobx';
import type { StarSystem, MarketData } from '../core/types';
import { STAR_SYSTEMS, getDistance } from '../data/galaxy';
import { generateMarket, updateMarketPrices } from '../services/EconomyService';

export class GalaxyStore {
  systems: StarSystem[] = [];
  markets: Map<string, MarketData> = new Map();
  selectedSystemId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  init() {
    this.systems = STAR_SYSTEMS.map(s => ({ ...s, planets: s.planets.map(p => ({ ...p })) }));
    this.systems
      .filter(s => s.hasTradePost)
      .forEach(s => {
        this.markets.set(s.id, generateMarket(s));
      });
  }

  loadState(systems: StarSystem[], markets: MarketData[]) {
    this.systems = systems;
    this.markets = new Map(markets.map(m => [m.systemId, m]));
  }

  get discoveredSystems(): StarSystem[] {
    return this.systems.filter(s => s.discovered);
  }

  getSystem(id: string): StarSystem | undefined {
    return this.systems.find(s => s.id === id);
  }

  getMarket(systemId: string): MarketData | undefined {
    return this.markets.get(systemId);
  }

  getConnections(systemId: string): StarSystem[] {
    const system = this.getSystem(systemId);
    if (!system) return [];
    return system.connections
      .map(id => this.getSystem(id))
      .filter((s): s is StarSystem => s !== undefined && s.discovered);
  }

  getAllConnections(systemId: string): StarSystem[] {
    const system = this.getSystem(systemId);
    if (!system) return [];
    return system.connections
      .map(id => this.getSystem(id))
      .filter((s): s is StarSystem => s !== undefined);
  }

  getTravelCost(fromId: string, toId: string): number {
    const from = this.getSystem(fromId);
    const to = this.getSystem(toId);
    if (!from || !to) return Infinity;
    return Math.round(getDistance(from.coordinates, to.coordinates) / 20);
  }

  discoverSystem(id: string) {
    const system = this.systems.find(s => s.id === id);
    if (system && !system.discovered) {
      system.discovered = true;
      if (system.hasTradePost && !this.markets.has(id)) {
        this.markets.set(id, generateMarket(system));
      }
    }
  }

  discoverConnectedSystems(systemId: string) {
    const system = this.getSystem(systemId);
    if (!system) return;
    system.connections.forEach(connId => {
      this.discoverSystem(connId);
    });
  }

  tickMarkets(gameTick: number) {
    this.markets.forEach((market, systemId) => {
      this.markets.set(systemId, updateMarketPrices(market, gameTick));
    });
  }

  updateMarketAfterTrade(systemId: string, commodityId: string, quantityChange: number) {
    const market = this.markets.get(systemId);
    if (!market) return;
    const listing = market.listings.find(l => l.commodityId === commodityId);
    if (listing) {
      listing.supply = Math.max(0, listing.supply + quantityChange);
    }
  }

  selectSystem(id: string | null) {
    this.selectedSystemId = id;
  }

  get marketsArray(): MarketData[] {
    return Array.from(this.markets.values());
  }
}
