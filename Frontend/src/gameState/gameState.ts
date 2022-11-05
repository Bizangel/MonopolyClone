import create from 'zustand'

type GameState = {
  players: number,
}

export const useGameState = create<GameState>()((set) => ({
  players: 10,

}))