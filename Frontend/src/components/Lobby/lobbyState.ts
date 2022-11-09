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

/** This is an inmemory lobby thing */
type TemporaryLocalLobby = {
  preview: PlayerCharacter,
  selected: PlayerCharacter,

  setPreview: (selected: PlayerCharacter) => void,
  setSelected: (selected: PlayerCharacter) => void,
  removePreview: () => void,
}

export const useTemporaryLocalLobby = create<TemporaryLocalLobby>()((set, get) => ({
  preview: PlayerCharacter.Car,
  selected: PlayerCharacter.Car,
  setPreview: (prev: PlayerCharacter) => { set({ preview: prev }); },
  setSelected: (selected: PlayerCharacter) => { set({ selected: selected }); },
  removePreview: () => { set({ preview: get().selected }) }
}))