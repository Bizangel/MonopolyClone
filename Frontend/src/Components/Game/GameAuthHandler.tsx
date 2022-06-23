import React, { useContext, useEffect, useState } from "react"

import { LoginFormPage, RegisterFormPage } from "../Login";
import { Gamepage } from "./GamePage";
import { GameContext, MonopolyGame } from "../../Game";
import { readCookie } from "../../common";

export enum DisplayState {
  Game,
  Login,
  Register,
}


function cookieCheckGoToGame(stateChanger: React.Dispatch<React.SetStateAction<DisplayState>>, game: MonopolyGame) {
  var userCookie = readCookie("Auth-User");
  if (userCookie !== null) {
    // no need for auth, create usersocket right away
    stateChanger(DisplayState.Game);
    game.initializeUserSocket(userCookie);
  }
}

export function GameAuthHandler() {
  const game = useContext(GameContext);
  const [currentDisplay, setDisplayState] = useState(DisplayState.Login);


  useEffect(() => {
    cookieCheckGoToGame(setDisplayState, game);
  }, [game])

  function goToLogin() {
    return setDisplayState(DisplayState.Login);
  }

  function goToRegister() {
    return setDisplayState(DisplayState.Register);
  }

  function onLoginSuccess() {
    cookieCheckGoToGame(setDisplayState, game);
  }



  /* Rendering */
  var display;
  switch (currentDisplay) {
    case DisplayState.Game:
      display = <Gamepage />
      break;

    case DisplayState.Login:
      display = <LoginFormPage onLoginSuccess={onLoginSuccess} onRegisterClick={goToRegister} />;
      break;

    case DisplayState.Register:
      display = <RegisterFormPage onLoginClick={goToLogin} />
      break;
  }

  return (
    display
  )
}
