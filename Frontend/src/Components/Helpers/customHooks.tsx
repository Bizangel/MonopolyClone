import { useEffect, useState } from "react";


// type eventKeyHandler = (event: KeyboardEvent) => void

// // Hook
// export function useEventListener(eventName, handler, element = window) {
//   // Create a ref that stores handler
//   const savedHandler = useRef<eventKeyHandler>(() => { });

//   // Update ref.current value if handler changes.
//   // This allows our effect below to always get latest handler ...
//   // ... without us needing to pass it in effect deps array ...
//   // ... and potentially cause effect to re-run every render.
//   useEffect(() => {
//     savedHandler.current = handler;
//   }, [handler]);

//   useEffect(
//     () => {
//       // Make sure element supports addEventListener
//       // On 
//       const isSupported = element && element.addEventListener;
//       if (!isSupported) return;

//       // Create event listener that calls handler function stored in ref
//       const eventListener = event => savedHandler.current(event);

//       // Add event listener
//       element.addEventListener(eventName, eventListener);

//       // Remove event listener on cleanup
//       return () => {
//         element.removeEventListener(eventName, eventListener);
//       };
//     },
//     [eventName, element] // Re-run if eventName or element changes
//   );
// };

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
