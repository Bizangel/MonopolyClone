import { PlayerCharacter } from 'common/characterModelConstants'
import create from 'zustand'

type GameState = {
  currentTurn: 0,
  players: Player[],

  updateNewState: (newState: GameState) => void,
}

type Player = {
  name: string,
  location: number,
  money: number,
  character: PlayerCharacter,
}

export const useGameState = create<GameState>()((set) => ({
  players: [],
  currentTurn: 0,


  updateNewState: (newState: GameState) => { set(newState); }
}))