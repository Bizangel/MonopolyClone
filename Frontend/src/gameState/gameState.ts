import { PlayerCharacter } from 'common/characterModelConstants'
import internal from 'stream'
import create from 'zustand'
import { initialUI, UIState } from './uiState'

type GameState = {
  uiState: UIState
  currentTurn: 0,
  players: Player[],

  updateNewState: (newState: GameState) => void,
}

type Player = {
  name: string,
  location: number,
  money: number,
  character: PlayerCharacter,
  properties: PropertyDeed[],
};

export type PropertyDeed = {
  propertyID: number,
  upgradeState: number,
};

export const useGameState = create<GameState>()((set) => ({
  uiState: initialUI,
  players: [],
  currentTurn: 0,


  updateNewState: (newState: GameState) => { set(newState); }
}))