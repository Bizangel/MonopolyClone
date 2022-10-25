import { useCallback, useEffect } from "react"


export function useOnKeyDown(key: string, callback: () => void) {
  const listener = useCallback((e: KeyboardEvent) => {
    if (e.key === key) {
      callback();
    }
  }, [callback, key])

  useEffect(() => {
    window.addEventListener("keydown", listener)
    return () => {
      window.removeEventListener("keydown", listener)
    }
  }, [listener])
}