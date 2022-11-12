
import { useEffect } from "react"


const StoredEventListeners = new Map<string, (payload: any) => void>();


export function useAwaitInternalEvent(eventID: string, callback: (payload: any) => void) {
  useEffect(
    () => {
      var hasprevid = StoredEventListeners.get(eventID);
      if (hasprevid)
        throw new Error("Reusing internal event ID");

      StoredEventListeners.set(eventID, callback);

      return () => {
        StoredEventListeners.delete(eventID);
      }
    }
    , [eventID, callback])
}

export function useInternalEvent(internalEventID: string) {
  return (payload: any = undefined) => {
    var callback = StoredEventListeners.get(internalEventID);
    if (callback)
      callback(payload);
    else
      console.warn(`Emitted unawaited event: ${internalEventID}`);
  }
}