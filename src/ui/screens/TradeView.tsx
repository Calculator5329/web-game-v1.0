import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { HoloPanel } from '../components/HoloPanel';
import { Button } from '../components/Button';
import { getCommodityById } from '../../data/commodities';
import { calculateBuyPrice, calculateSellPrice, canBuy, executeBuy, executeSell, createTradeRecord } from '../../services/EconomyService';
import type { MarketListing } from '../../core/types';

export const TradeView = observer(function TradeView() {
  const store = useStore();
  const { playerStore, galaxyStore } = store;
  const market = galaxyStore.getMarket(playerStore.player.currentSystem);
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!market) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No trading post in this system.</div>;

  const selected = selectedCommodity ? market.listings.find(l => l.commodityId === selectedCommodity) : null;
  const commodity = selectedCommodity ? getCommodityById(selectedCommodity) : null;
  const playerHas = selectedCommodity ? playerStore.player.cargo.find(c => c.commodityId === selectedCommodity)?.quantity ?? 0 : 0;

  const handleBuy = (listing: MarketListing, qty: number) => {
    const check = canBuy(playerStore.player.credits, playerStore.player.cargo, playerStore.player.ship.cargoCapacity, listing, qty);
    if (!check.ok) {
      store.notify(check.reason ?? 'Cannot buy', 'warning');
      return;
    }
    const cost = calculateBuyPrice(listing, qty);
    playerStore.addCredits(-cost);
    playerStore.updateCargo(executeBuy(playerStore.player.cargo, listing.commodityId, qty));
    galaxyStore.updateMarketAfterTrade(market.systemId, listing.commodityId, -qty);
    playerStore.addTradeRecord(createTradeRecord(listing.commodityId, qty, listing.price, market.systemId, 'buy', store.gameTick));
    store.storyStore.onTradeCompleted(cost);
    store.notify(`Bought ${qty}x ${commodity?.name ?? listing.commodityId} for ${cost} CR`, 'success');
  };

  const handleSell = (listing: MarketListing, qty: number) => {
    if (playerHas < qty) { store.notify('Not enough in cargo', 'warning'); return; }
    const revenue = calculateSellPrice(listing, qty);
    playerStore.addCredits(revenue);
    playerStore.updateCargo(executeSell(playerStore.player.cargo, listing.commodityId, qty));
    galaxyStore.updateMarketAfterTrade(market.systemId, listing.commodityId, qty);
    playerStore.addTradeRecord(createTradeRecord(listing.commodityId, qty, listing.price, market.systemId, 'sell', store.gameTick));
    store.storyStore.onTradeCompleted(revenue);
    store.notify(`Sold ${qty}x ${commodity?.name ?? listing.commodityId} for ${revenue} CR`, 'success');
  };

  const trendIcon = (t: string) => t === 'rising' ? '▲' : t === 'falling' ? '▼' : '─';
  const trendColor = (t: string) => t === 'rising' ? 'var(--green)' : t === 'falling' ? 'var(--red)' : 'var(--text-dim)';

  return (
    <div style={{ height: '100%', padding: '20px', display: 'flex', gap: '16px', overflow: 'hidden' }}>
      {/* Market listings */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <HoloPanel title="Market" accent="var(--gold)" corners scanline>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr 0.7fr 0.5fr', gap: '0', fontSize: '0.7rem' }}>
            <div style={headerStyle}>COMMODITY</div>
            <div style={headerStyle}>PRICE</div>
            <div style={headerStyle}>SUPPLY</div>
            <div style={headerStyle}>DEMAND</div>
            <div style={headerStyle}>TREND</div>

            {market.listings.map(listing => {
              const com = getCommodityById(listing.commodityId);
              if (!com) return null;
              const isSelected = selectedCommodity === listing.commodityId;
              return [
                <div key={`${listing.commodityId}-name`}
                  onClick={() => { setSelectedCommodity(listing.commodityId); setQuantity(1); }}
                  style={{ ...cellStyle, color: isSelected ? 'var(--cyan)' : com.illegal ? 'var(--red)' : 'var(--text-primary)', cursor: 'pointer', fontWeight: isSelected ? 600 : 400 }}>
                  {com.illegal && '⚠ '}{com.name}
                </div>,
                <div key={`${listing.commodityId}-price`} style={{ ...cellStyle, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                  {listing.price} CR
                </div>,
                <div key={`${listing.commodityId}-supply`} style={{ ...cellStyle, fontFamily: 'var(--font-mono)', color: listing.supply < 10 ? 'var(--red)' : 'var(--text-secondary)' }}>
                  {listing.supply}
                </div>,
                <div key={`${listing.commodityId}-demand`} style={{ ...cellStyle, fontFamily: 'var(--font-mono)', color: listing.demand > 30 ? 'var(--green)' : 'var(--text-secondary)' }}>
                  {listing.demand}
                </div>,
                <div key={`${listing.commodityId}-trend`} style={{ ...cellStyle, color: trendColor(listing.trend), textAlign: 'center' }}>
                  {trendIcon(listing.trend)}
                </div>,
              ];
            })}
          </div>
        </HoloPanel>
      </div>

      {/* Trade panel */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <HoloPanel title="Your Cargo" accent="var(--cyan)" corners>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Capacity: </span>
            <span style={{ color: playerStore.currentCargoUsed >= playerStore.player.ship.cargoCapacity ? 'var(--red)' : 'var(--green)' }}>
              {playerStore.currentCargoUsed}/{playerStore.player.ship.cargoCapacity}
            </span>
            <span style={{ color: 'var(--text-dim)', marginLeft: '16px' }}>Credits: </span>
            <span style={{ color: 'var(--gold)' }}>{playerStore.player.credits.toLocaleString()}</span>
          </div>
          {playerStore.player.cargo.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Empty cargo hold</p>
          ) : (
            playerStore.player.cargo.map(item => {
              const com = getCommodityById(item.commodityId);
              return (
                <div key={item.commodityId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{com?.name ?? item.commodityId}</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>×{item.quantity}</span>
                </div>
              );
            })
          )}
          </HoloPanel>

        {selected && commodity && (
          <HoloPanel title="Trade" accent="var(--green)" glow corners>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {commodity.name}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px', lineHeight: 1.4 }}>
              {commodity.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>QTY:</label>
              <input
                type="number" min={1} max={99} value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '60px', padding: '6px', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                  textAlign: 'center', outline: 'none',
                }}
              />
              <button onClick={() => setQuantity(Math.min(selected.supply, playerStore.cargoFree))} style={{ ...qtyBtn }}>MAX</button>
            </div>

            <div style={{ fontSize: '0.75rem', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Buy price:</span>
                <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{calculateBuyPrice(selected, quantity)} CR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Sell price:</span>
                <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{calculateSellPrice(selected, quantity)} CR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                <span>In cargo:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{playerHas}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="success" fullWidth size="sm" onClick={() => handleBuy(selected, quantity)}
                disabled={!canBuy(playerStore.player.credits, playerStore.player.cargo, playerStore.player.ship.cargoCapacity, selected, quantity).ok}>
                Buy {quantity}
              </Button>
              <Button variant="danger" fullWidth size="sm" onClick={() => handleSell(selected, quantity)}
                disabled={playerHas < quantity}>
                Sell {quantity}
              </Button>
            </div>
          </HoloPanel>
        )}
      </div>
    </div>
  );
});

const headerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '1px',
  color: 'var(--text-dim)',
  padding: '6px 8px',
  borderBottom: '1px solid var(--border)',
  textTransform: 'uppercase',
};

const cellStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
};

const qtyBtn: React.CSSProperties = {
  padding: '4px 8px', background: 'rgba(0,240,255,0.1)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', color: 'var(--cyan)', fontSize: '0.65rem',
  fontFamily: 'var(--font-display)', letterSpacing: '1px', cursor: 'pointer',
};
