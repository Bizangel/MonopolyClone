import { PlayerCharacter } from 'common/characterModelConstants'
import create from 'zustand'

type Player = {
  name: string,
  character: PlayerCharacter | null,
}

export type LobbyState = {
  players: Player[],

  updateLobbyState: (newState: LobbyState) => void,
}

export const useLobbyState = create<LobbyState>()((set) => ({
  players: [],
  updateLobbyState: (newState: LobbyState) => { set(newState); }
}))