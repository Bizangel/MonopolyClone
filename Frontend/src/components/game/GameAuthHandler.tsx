import React, { useEffect, useState } from "react"

import { LoginFormPage, RegisterFormPage } from "../login";
import { Gamepage } from "./GamePage";
import { readCookie } from "common/common";

export enum DisplayState {
  Game,
  Login,
  Register,
}


function cookieCheckGoToGame(stateChanger: React.Dispatch<React.SetStateAction<DisplayState>>) {
  var userCookie = readCookie("Auth-User");
  if (userCookie !== null) {
    // no need for auth, create usersocket right away
    stateChanger(DisplayState.Game);
  }
}

export function GameAuthHandler() {

  const [currentDisplay, setDisplayState] = useState(DisplayState.Login);
  // const [currentDisplay, setDisplayState] = useState(DisplayState.Login);


  useEffect(() => {
    cookieCheckGoToGame(setDisplayState);
  }, [])

  function goToLogin() {
    return setDisplayState(DisplayState.Login);
  }

  function goToRegister() {
    return setDisplayState(DisplayState.Register);
  }

  function onLoginSuccess() {
    cookieCheckGoToGame(setDisplayState);
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
