// import React from "react";
import React from "react";
import { PlayerCharacter } from "../Components/Game/Player/PlayerCharacterCommons";


export class PlayerHandler {
  private _players = new Map<string, PlayerCharacter>(); // maps usernames to characters (Iron, Ship, etc)
  private _playerLocations = new Map<PlayerCharacter, number>(); // maps characters to tile locations 

  public get playerLocations() {
    return this._playerLocations;
  }

  registerPlayer(players: { username: string, character: PlayerCharacter }[]) {
    this._players.clear(); // re-register 
    players.forEach(({ username, character }) => {
      this._players.set(username, character);
      this._playerLocations.set(character, 0);
    }
    )
  }

  updatePlayersLocations(locations: { character: PlayerCharacter, location: number }[],
    ui_setter?: React.Dispatch<React.SetStateAction<Map<PlayerCharacter, number>>>) {
    locations.forEach(({ character, location }) => {
      var newLoc = new Map(this._playerLocations);
      newLoc.set(character, location);
      this._playerLocations = newLoc;
      if (ui_setter !== undefined)
        ui_setter(this._playerLocations)
    })
  }
}

export const playerHandler = new PlayerHandler();
export const playerHandlerContext = React.createContext<PlayerHandler>(playerHandler);