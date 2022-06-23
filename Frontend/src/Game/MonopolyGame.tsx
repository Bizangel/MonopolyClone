import { UserSocket } from "../SocketEvents";
import React from "react";

export class MonopolyGame {
  public userSocket: UserSocket | null;

  constructor() {
    this.userSocket = null;
  }

  public initializeUserSocket = (username: string) => {
    if (this.userSocket !== null)
      return;

    var socket = new UserSocket(username);

    // perform ticket and all login logic
    socket.onReady(() => { console.log("I was called as an opening callback!") })

    socket.onClose(() => { console.log("I was called as a closing callback!") })

    socket.on("testEvent", (payload: string) => { console.log("I was called as sampleEvent callback!" + payload) })
    socket.on("testEvent", (payload: string) => { console.log("I was called as yet another callback!" + payload) })

    socket.onUnauthorized(() => { console.log("unauthorized callback") })

    socket.Initialize();

    this.userSocket = socket;
  }

  public closeUserSocket = () => {
    console.log("Socket was closed manually")
    if (this.userSocket !== null) {
      this.userSocket.Close();
    }
  }

  public isSocketInitialized() {
    return this.userSocket !== null;
  }
}

export const game = new MonopolyGame();
export const GameContext = React.createContext<MonopolyGame>(game);