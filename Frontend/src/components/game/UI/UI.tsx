import { useState } from "react";
import { useInternalEvent } from "hooks/internalEvent";
import { Button, Row } from "react-bootstrap";
import { DiceDisplay } from "./DiceDisplay";
import { AnimatePresence, motion } from "framer-motion"
import { MultipleUserBars } from "./UserBar/UserBar"
import { useGameState } from "gameState/gameState";
import { useUserSocket } from "hooks/socketProvider";
import { useAwaitInternalEvent } from "hooks/internalEvent";
import { AuctionOverlay } from "./BuyAuctionUI/AuctionOverlay";

export function UI() {
  const userSocket = useUserSocket();

  const UIState = useGameState(e => e.uiState);
  const currentTurn = useGameState(e => e.currentTurn);
  const currentPlayers = useGameState(e => e.players);
  const [diceFocused, setDiceFocus] = useState(false);
  var isCurrentTurn = userSocket.Username === currentPlayers[currentTurn].name;

  const throwDice = useInternalEvent("perform-internal-dice-throw");

  useAwaitInternalEvent("dice-set-focus", (focus: boolean) => {
    setDiceFocus(focus);
  })

  var colorDisplayText = isCurrentTurn ? "text-primary" : "text-secondary";
  var displayText = isCurrentTurn ? "It's your turn" : (
    <p>
      It's <i> {currentPlayers[currentTurn].name}</i> turn
    </p>
  )

  colorDisplayText = "text-info";
  displayText = "Auction!";

  return (
    <>
      <div style={{
        position: "absolute", left: "0px", top: "0px", zIndex: 1,
        width: "100vw", justifyItems: "center", textAlign: "center",
        fontSize: "2.5vw"
      }}
        className={colorDisplayText}>
        {displayText}
      </div>

      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1 }}>
        <AuctionOverlay />
      </div>

      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1 }}>
        <MultipleUserBars />
      </div>

      <motion.div
        onClick={() => { setDiceFocus(e => !e) }}
        style={
          { position: "absolute", zIndex: 1, opacity: 0.7 }
        }
        initial={{
          top: "2vw",
          right: "2vw",
          scale: 1,
          opacity: 0.8,
        }}
        animate={{
          top: !diceFocused ? "2vw" : "45vh",
          right: !diceFocused ? "2vw" : "45vw",
          scale: !diceFocused ? 1 : 3,
          opacity: !diceFocused ? 0.8 : 1,
        }}
        transition={{
          type: "tween"
        }}
      >
        <Row>
          <DiceDisplay number={UIState.displayDices[0]} />
          <DiceDisplay number={UIState.displayDices[1]} />
        </Row>
      </motion.div>

      <div style={{
        zIndex: 1,
        position: "absolute", left: "45vw", bottom: "5vh", width: "10vw", height: "10vh",
        alignItems: "center", textAlign: "center", display: "inline-block", pointerEvents: "none",
      }} >
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