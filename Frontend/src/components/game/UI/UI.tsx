import { useInternalEvent } from "hooks/internalEvent";
import { Button, Row } from "react-bootstrap";
import { DiceDisplay } from "./DiceDisplay";
import { AnimatePresence, motion } from "framer-motion"
import { MultipleUserBars } from "./UserBar/UserBar"
import { useGameState } from "gameState/gameState";
import { useUserSocket } from "hooks/socketProvider";


export function UI() {
  const userSocket = useUserSocket();
  const currentTurn = useGameState(e => e.currentTurn);
  const currentPlayers = useGameState(e => e.players);
  var isCurrentTurn = userSocket.Username === currentPlayers[currentTurn].name;

  const throwDice = useInternalEvent("perform-internal-dice-throw");

  var colorDisplayText = isCurrentTurn ? "text-primary" : "text-secondary";

  return (
    <>
      <div style={{
        position: "absolute", left: "0px", top: "0px", zIndex: 0.5,
        width: "100vw", justifyItems: "center", textAlign: "center",
        fontSize: "3vw"
      }}
        className={colorDisplayText}>
      </div>

      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1 }}>
        <MultipleUserBars />
      </div>

      <div style={{ position: "absolute", right: "20px", top: "2vh", zIndex: 1, opacity: 0.7 }}>
        <Row>
          <DiceDisplay number={5} />
          <DiceDisplay number={2} />
        </Row>
      </div>

      <div style={{
        zIndex: 1,
        position: "absolute", left: "45vw", bottom: "5vh", width: "10vw", height: "10vh",
        alignItems: "center", textAlign: "center", display: "inline-block"
      }}>
        <AnimatePresence>
          {
            isCurrentTurn &&
            <motion.div
              style={{ zIndex: 1 }}
              whileHover={{ scale: 1.2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button onClick={() => { throwDice() }} variant="primary" style={{ zIndex: 1 }}>
                Roll Dice!
              </Button>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </>
  )
}