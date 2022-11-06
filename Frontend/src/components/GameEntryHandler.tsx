import React, { useEffect, useState } from "react"

import { LoginFormPage, RegisterFormPage } from "components/login";
import { readCookie } from "common/common";
import { LobbyHandler } from "./LobbyHandler";

export enum DisplayState {
  LobbyGame,
  Login,
  Register,
}


function cookieCheckGoToGame(stateChanger: React.Dispatch<React.SetStateAction<DisplayState>>) {
  var userCookie = readCookie("Auth-User");
  if (userCookie !== null) {
    // no need for auth, create usersocket right away
    stateChanger(DisplayState.LobbyGame);
  }
}

/**
 * Handles the redirection to the main pages, such as lobby and others.
 */
export function GameEntryHandler() {

  const [currentDisplay, setDisplayState] = useState(DisplayState.Login);

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
    case DisplayState.LobbyGame:
      display = <LobbyHandler />
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
