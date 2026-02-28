import { createContext, useContext } from 'react';
import { GameStore } from './GameStore';

export const gameStore = new GameStore();

export const StoreContext = createContext<GameStore>(gameStore);

export function useStore(): GameStore {
  return useContext(StoreContext);
}
