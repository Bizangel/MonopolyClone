import { UserSocket } from "gamehandlers/socketEvents";
import React, { useEffect, useContext, useRef } from "react";


type userSocketMutable = React.MutableRefObject<UserSocket>
export const userSocketContext = React.createContext<userSocketMutable | undefined>(undefined)

export function useUserSocketProvider() {
  const userSocketValue = useRef<UserSocket>(new UserSocket());
  return userSocketValue;
};

export function useUserSocket() {
  const userSocket = useContext(userSocketContext)
  if (userSocket === undefined) {
    throw new Error("Using useUserSocket hook outside of provider context")
  }
  return userSocket.current;
}

export function useUserSocketInitialize() {
  const userSocket = useUserSocket()
  useEffect(
    () => {
      var socket = userSocket;
      socket.Initialize();
      return () => { socket.Close(); }
    }
    , [userSocket]);

  return userSocket;
}


