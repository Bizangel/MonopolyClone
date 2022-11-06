import { useGameState } from "gameState/gameState";
import { useUserSocketInitialize } from "hooks/socketProvider";
import { useSocketEvent } from "hooks/useSocketEvent";
import React, { useState } from "react"
import { Gamepage } from "./game/GamePage";
import { LobbyPage } from "./Lobby/LobbyPage";

enum LobbyState {
  Lobby,
  Game,
}

/**
 * Handles the lobby, character choosing and whether to go directly in the game
 * At this point the websocket ocnnection is active and fully open.
 */
export function LobbyHandler() {
  useUserSocketInitialize();
  const [currentDisplay, setDisplayState] = useState(LobbyState.Lobby);
  const updateNewState = useGameState(e => e.updateNewState)

  useSocketEvent("state-update", (payload) => {
    console.log("Update!: ", payload)
    updateNewState(payload)
    setDisplayState(LobbyState.Game) // auto-sets to game
  });

  /* Rendering */
  var display;
  switch (currentDisplay) {
    case LobbyState.Game:
      display = <Gamepage />
      break;

    case LobbyState.Lobby:
      display = <LobbyPage />
      break;
  }

  return (
    display
  )
}
