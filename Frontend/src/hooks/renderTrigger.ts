import { useEffect, useState } from "react";




/**
 * Custom Hook, can be used to trigger a component re-render at will.
 * @returns A callback, call it to trigger the component rendering.
 */
export function useRenderTrigger() {
  const [renderWatcher, reRender] = useState(false);
  useEffect(
    () => { }
    , [renderWatcher]);

  return () => { reRender(val => !val) };
}
