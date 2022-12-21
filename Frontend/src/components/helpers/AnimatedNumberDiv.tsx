import { animate } from "framer-motion";
import React, { useEffect, useRef } from "react";

export function AnimatedNumberDiv(props: { value: number, durationSeconds?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node === null)
      return;

    const currentVal = parseInt(node.textContent ? node.textContent : "0");

    const decreasing = currentVal < props.value;

    const controls = animate(currentVal, props.value, {
      ease: [0, .74, .3, 1], // very slow ending bezier
      duration: props.durationSeconds ? props.durationSeconds : 3,

      onUpdate(val) {
        node.textContent = val.toFixed(0);
        node.style.color = decreasing ? "green" : "red"
      },
      onComplete() {
        node.style.color = props.value < 0 ? "#ff0000" : "";
      }
    })


    return () => {
      controls.stop();
      node.style.color = "";
    };
  }, [props.value, props.durationSeconds]);

  return <span ref={ref} />;
}