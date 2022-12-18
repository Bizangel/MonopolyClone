import { PlayerCharacter } from 'common/characterModelConstants'
import create from 'zustand'
import { initialUI, UIState } from './uiState'
import { produce } from "immer"

type GameState = {
  uiState: UIState
  currentTurn: 0,
  players: Player[],

  updateNewState: (newState: GameState) => void,
}

export type Player = {
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

// Actually helpful debugging tool
if (process.env.NODE_ENV === 'development') {
  function modifyGameState(modification: (mods: GameState) => void) {
    useGameState.setState((prev => {
      const poststate = produce(prev, modification);
      console.log(poststate);
      return poststate;
    }))


  };
  // @ts-ignore
  window.modifyGameState = modifyGameState;
}



