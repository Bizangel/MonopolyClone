
import { useEffect } from "react"


const StoredEventListeners = new Map<string, () => void>();


export function useAwaitInternalEvent(eventID: string, callback: () => void) {
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
  return () => {
    var callback = StoredEventListeners.get(internalEventID);
    if (callback)
      callback();
    else
      console.warn(`Emitted unawaited event: ${internalEventID}`);
  }
}