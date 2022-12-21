import { useGameState } from "gameState/gameState";
import { useUserSocketInitialize } from "hooks/socketProvider";
import { useSocketEvent } from "hooks/useSocketEvent";
import React, { useState } from "react"
import { Gamepage } from "./game/GamePage";
import { LobbyPage } from "./Lobby/LobbyPage";
import { GameResultPage } from "./gameResults/gameResults";
import { GameResult } from "gameState/gameResult";

enum LobbyState {
  Lobby,
  Game,
  GameResults,
}

/**
 * Handles the lobby, character choosing and whether to go directly in the game
 * At this point the websocket ocnnection is active and fully open.
 */
export function LobbyHandler() {
  useUserSocketInitialize();

  const [results, setGameResults] = useState<GameResult | null>(null);

  const [currentDisplay, setDisplayState] = useState(LobbyState.Lobby);
  const updateNewState = useGameState(e => e.updateNewState)

  useSocketEvent("state-update", (payload) => {
    console.log("Update!: ", payload)
    updateNewState(payload)
    setDisplayState(LobbyState.Game) // auto-sets to game
    setGameResults(null) // resets any result there might be leftover or smth
  });

  useSocketEvent("game-done-results", (payload: GameResult) => {
    console.log("Received game results!: ", payload)
    setGameResults(payload);

    setDisplayState(LobbyState.GameResults);
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
    case LobbyState.GameResults:
      if (results === null)
        throw new Error("Displaying game results page without results");
      display = <GameResultPage results={results} />
  }

  return (
    display
  )
}
