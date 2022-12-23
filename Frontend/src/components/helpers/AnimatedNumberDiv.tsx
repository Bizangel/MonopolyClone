import { Tween, animate } from "framer-motion";
import React, { useEffect, useRef } from "react";

export function AnimatedNumberDiv(props: { value: number, durationSeconds?: number, ease?: Tween["ease"] }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node === null)
      return;

    const currentVal = parseInt(node.textContent ? node.textContent : "0");

    const controls = animate(currentVal, props.value, {
      ease: props.ease,
      duration: props.durationSeconds ? props.durationSeconds : 3,

      onUpdate(val) {
        node.textContent = val.toFixed(0);
        if (currentVal === props.value) {
          node.style.color = currentVal < 0 ? "red" : ""
          return;
        }

        node.style.color = currentVal < props.value ? "green" : "red"
      },
      onComplete() {
        console.log("animation completed: ", props.value, "my div is: ", ref.current);
        console.log("Should be set to:  ", props.value < 0 ? ["#ff0000"] : [""]);
        node.style.color = props.value < 0 ? "#ff0000" : "";
        if (ref.current)
          ref.current.style.color = props.value < 0 ? "#ff0000" : "";
        console.log("set style", [node.style.color]
        );
      }
    })


    return () => {
      console.log("running cleanup for: ", props.value)
      controls.stop();
      node.style.color = "";
    };
  }, [props.value, props.durationSeconds, props.ease]);

  return <span ref={ref} />;
}