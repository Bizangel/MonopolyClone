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

  return (
    <>
      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1 }}>
        <MultipleUserBars />
      </div>

      <div style={{ position: "absolute", right: "20px", top: "2vh", zIndex: 1, opacity: 0.7 }}>
        <Row>
          <DiceDisplay number={5} />
          <DiceDisplay number={2} />
        </Row>
      </div>


      {/*  actual button */}


      <AnimatePresence>
        {
          isCurrentTurn &&
          <motion.div
            // whileHover={{ scale: 1.2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              position: "absolute", left: "45vw", bottom: "5vh", width: "10vw", height: "10vh", zIndex: 1,
              alignItems: "center", textAlign: "center", display: "inline-block"
            }}>
              <motion.div
                whileHover={{ scale: 1.2 }}
              >
                <Button onClick={() => { throwDice() }} variant="primary">
                  Roll Dice!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </>
  )
}