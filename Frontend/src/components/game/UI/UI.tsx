import { useState } from "react";
import { useInternalEvent } from "hooks/internalEvent";
import { Button, Row } from "react-bootstrap";
import { DiceDisplay } from "./DiceDisplay";
import { AnimatePresence, motion } from "framer-motion"
import { MultipleUserBars } from "./UserBar/UserBar"
import { useGameState } from "gameState/gameState";
import { useUserSocket } from "hooks/socketProvider";
import { useAwaitInternalEvent } from "hooks/internalEvent";
// import { AuctionOverlay } from "./BuyAuctionUI/AuctionOverlay";
import { BuyOverlay } from "./BuyAuctionUI/BuyOverlay";
import { TurnPhase } from "gameState/uiState";
import { useCharacterStoppedStore } from "../Player/CharacterModel";
import { EffectAcknowledgeOverlay } from "./BuyAuctionUI/EffectAcknowledgeOverlay";
import { AuctionOverlay } from "./BuyAuctionUI/AuctionOverlay";

export function UI() {
  const userSocket = useUserSocket();

  const UIState = useGameState(e => e.uiState);
  const currentTurn = useGameState(e => e.currentTurn);
  const currentPlayers = useGameState(e => e.players);
  const [diceFocused, setDiceFocus] = useState(false);
  const characterToStopped = useCharacterStoppedStore(e => e.characterToStopped);

  var isCurrentTurn = userSocket.Username === currentPlayers[currentTurn].name;

  const throwDice = useInternalEvent("perform-internal-dice-throw");

  useAwaitInternalEvent("dice-set-focus", (focus: boolean) => {
    setDiceFocus(focus);
  })

  var topDisplayColor = "";
  var topDisplay: React.ReactNode = "";
  switch (UIState.turnPhase) {
    case TurnPhase.Standby:
      topDisplay = isCurrentTurn ? "It's your turn" : (
        <p>
          It's <i> {currentPlayers[currentTurn].name}</i> turn
        </p>
      )
      topDisplayColor = isCurrentTurn ? "text-primary" : "text-secondary";
      break;
    case TurnPhase.Choiceby:
      topDisplay = isCurrentTurn ? "It's your turn" : (
        <p>
          It's <i> {currentPlayers[currentTurn].name}</i> turn
        </p>
      )
      topDisplayColor = isCurrentTurn ? "text-primary" : "text-secondary";
      break;
    case TurnPhase.Auctionby:
      topDisplayColor = "text-info";
      topDisplay = "Auction!";
      break;
  }

  return (
    <>
      <div style={{
        position: "absolute", left: "0px", top: "0px", zIndex: 1,
        width: "100vw", justifyItems: "center", textAlign: "center",
        fontSize: "2.5vw"
      }}
        className={topDisplayColor}>
        {topDisplay}
      </div>

      <div style={{
        position: "absolute", left: "0px", top: "0px", zIndex: 1,
        width: "100vw", justifyItems: "center", textAlign: "center",
        fontSize: "2.5vw"
      }}
        className={topDisplayColor}>
        {topDisplay}
      </div>

      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1, pointerEvents: "none" }}>
        <AnimatePresence>
          {
            UIState.currentAuction &&
            <motion.div
              style={{ zIndex: 1 }}

              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
            >

              <AuctionOverlay auction={UIState.currentAuction} />
            </motion.div>
          }
        </AnimatePresence>
      </div>

      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1, pointerEvents: "none" }}>
        <AnimatePresence>
          {
            UIState.effectToAcknowledge && characterToStopped.get(currentPlayers[currentTurn].character) &&
            <motion.div
              style={{ zIndex: 1 }}

              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
            >

              <EffectAcknowledgeOverlay effect={UIState.effectToAcknowledge}
                enabled={isCurrentTurn}
              />
            </motion.div>
          }
        </AnimatePresence>
      </div>


      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1, pointerEvents: "none" }}>
        <AnimatePresence>
          {
            UIState.propertyToBuy && characterToStopped.get(currentPlayers[currentTurn].character) &&
            <motion.div
              style={{ zIndex: 1 }}

              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <BuyOverlay propertyID={UIState.propertyToBuy.propertyID}
                price={UIState.propertyToBuy.price}
                canPay={currentPlayers[currentTurn].money >= UIState.propertyToBuy.price}
                enabled={isCurrentTurn} />
            </motion.div>
          }
        </AnimatePresence>
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
            isCurrentTurn && UIState.turnPhase === TurnPhase.Standby &&
            <motion.div
              style={{ zIndex: 1 }}
              whileHover={{ scale: 1.2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button onClick={() => { throwDice() }} variant="primary" style={{ zIndex: 1, pointerEvents: "auto" }}>
                Roll Dice!
              </Button>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </>
  )
}