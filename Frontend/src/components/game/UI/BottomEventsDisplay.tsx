import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { useSocketEvent } from "hooks/useSocketEvent";

export function BottomDisplayEvents() {


  const [currentDisplay, setCurrentDisplay] = useState("");

  useSocketEvent("message-display", (message: string) => {
    setCurrentDisplay(message);
  });

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setCurrentDisplay("");
    }, 7500)

    return () => {
      clearTimeout(timeOutId);
    };
  }, [currentDisplay]);


  return (
    <div style={{
      position: "absolute", left: "0px", bottom: "0px", zIndex: 1,
      width: "100vw", textAlign: "center",
      fontSize: "2.5vw",
      pointerEvents: "none",
    }
    }
      onContextMenu={(e) => { e.preventDefault() }}
      className="text-primary mb-3 items-center justify-content-end d-flex">

      <AnimatePresence>
        {
          currentDisplay !== "" &&
          <motion.div
            onContextMenu={(e) => { e.preventDefault() }}
            style={{ zIndex: 1 }}

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="justify-content-center items-center d-flex"
          >

            <Card className="m-2" style={{ maxWidth: "70%", backgroundColor: "rgba(255,255,255,0.5)" }}>
              {currentDisplay}
            </Card>
          </motion.div>

        }
      </AnimatePresence>
    </div>
  )
}