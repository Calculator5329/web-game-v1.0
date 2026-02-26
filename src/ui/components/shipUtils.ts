export type ShipType = 'player_scout' | 'player_fighter' | 'player_trader' | 'player_explorer' | 'enemy_raider' | 'enemy_cruiser' | 'enemy_drone' | 'enemy_hulk' | 'enemy_guardian';

export function getShipType(name: string, isPlayer: boolean): ShipType {
  if (isPlayer) {
    const lower = name.toLowerCase();
    if (lower.includes('fighter') || lower.includes('starblade')) return 'player_fighter';
    if (lower.includes('trader') || lower.includes('merchant')) return 'player_trader';
    if (lower.includes('explorer') || lower.includes('pathfinder')) return 'player_explorer';
    return 'player_scout';
  }
  const lower = name.toLowerCase();
  if (lower.includes('guardian') || lower.includes('archive')) return 'enemy_guardian';
  if (lower.includes('cruiser') || lower.includes('patrol')) return 'enemy_cruiser';
  if (lower.includes('drone') || lower.includes('synthetic')) return 'enemy_drone';
  if (lower.includes('hulk') || lower.includes('scavenger')) return 'enemy_hulk';
  return 'enemy_raider';
}
