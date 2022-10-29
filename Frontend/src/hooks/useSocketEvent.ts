import { SocketEventCallback } from "gamehandlers/socketEvents/SocketHandler"
import { useEffect } from "react"
import { useUserSocket } from "./socketProvider"

export function useSocketEvent(event: string, callback: SocketEventCallback) {
  const userSocket = useUserSocket()

  useEffect(() => {
    const id = userSocket.on(event, callback);

    return () => { userSocket.off(event, id); }
  }, [callback, event, userSocket])
}