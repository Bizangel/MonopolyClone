import { animate } from "framer-motion";
import React, { useEffect, useRef } from "react";

export function AnimatedNumberFramerMotion(props: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node === null)
      return;

    const currentVal = parseInt(node.textContent ? node.textContent : "0");

    const decreasing = currentVal < props.value;

    const controls = animate(currentVal, props.value, {
      duration: 3,
      onUpdate(val) {
        node.textContent = val.toFixed(0);
        node.style.color = decreasing ? "green" : "red"
      },
      onComplete() {
        node.style.color = "";
      }
    })


    return () => {
      controls.stop();
      node.style.color = "";
    };
  }, [props.value]);

  return <span ref={ref} />;
}