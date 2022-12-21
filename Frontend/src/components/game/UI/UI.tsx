import React, { useEffect, useState } from "react";
import { useInternalEvent } from "hooks/internalEvent";
import { Button, Row } from "react-bootstrap";
import { DiceDisplay } from "./DiceDisplay";
import { AnimatePresence, motion } from "framer-motion"
import { MultipleUserBars } from "./UserBar/UserBar"
import { useGameState } from "gameState/gameState";
import { useUserSocket } from "hooks/socketProvider";
import { useAwaitInternalEvent } from "hooks/internalEvent";
import { BuyOverlay } from "./BuyAuctionUI/BuyOverlay";
import { TurnPhase } from "gameState/uiState";
import { useCharacterStoppedStore } from "../Player/CharacterModel";
import { EffectAcknowledgeOverlay } from "./BuyAuctionUI/EffectAcknowledgeOverlay";
import { AuctionOverlay } from "./BuyAuctionUI/AuctionOverlay";
import { TradeOverlay } from "./TradeUI/TradeOverlay";
import { PropertyDetailsOverlay } from "./BuyAuctionUI/PropertyDetailsUpgrade";
import { BottomDisplayEvents } from "./BottomEventsDisplay";
import { useIsAnyDiceRolling } from "../Board/GameDiceHandler";

/**
 * The UI is one big div that effectively dispalys all user UI.
 *
 * It is composed by the following overlays, which not always are displayed at all times:
 *
 * TopDisplay -> Atop Display that shows turns, trade, auction, etc
 * DiceDisplay -> Displays last dice roll
 * UserBarsOverlay -> Effectively top left corner display of all users and their money
 * EffectAcknowledge -> Overlay shown to accept and acknowledge effects, like paying or negative effects.
 * PropertyDetails -> The Details property overlay shown when a user clicks a property. This is an unsynced UI overlay as of the moment.
 * BuyOverlay -> The overlay to display when the player should make the choice of buying or auctioning
 * TradeOverlay -> The overlay to display when there's a currently active trade.
 * RollDiceButton -> Effectively the dice button, which should be clicked to roll the dice and proceed the turn.
 *
 * */
export function UI(props: {
  shouldAllowDetails: boolean, setShouldAllowDetails: React.Dispatch<React.SetStateAction<boolean>>
  displayDetailProperty: number | null, hideDetail: () => void
}) {
  const userSocket = useUserSocket();
  const UIState = useGameState(e => e.uiState);
  const currentTurn = useGameState(e => e.currentTurn);
  const currentPlayers = useGameState(e => e.players);
  const [diceFocused, setDiceFocus] = useState(false);
  const characterToStopped = useCharacterStoppedStore(e => e.characterToStopped);
  const isAnyDiceRolling = useIsAnyDiceRolling(e => e.isAnyDiceRolling);

  var isCurrentTurn = userSocket.Username === currentPlayers[currentTurn].name;

  const throwDice = useInternalEvent("perform-internal-dice-throw");

  useAwaitInternalEvent("dice-set-focus", (focus: boolean) => {
    setDiceFocus(focus);
  })

  // Hide Details Tab, and disallow it whenever big UIs pop up
  useEffect(() => {
    if (UIState.currentAuction || UIState.currentTrade || UIState.effectToAcknowledge || UIState.propertyToBuy) {
      props.hideDetail(); // hide the details panel
      props.setShouldAllowDetails(false);// disallow it
    } else {
      props.setShouldAllowDetails(true); // if panels are gone allow it
    }
  },
    [UIState, props])


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
      topDisplay = "Auction";
      break;
    case TurnPhase.Mortgageby:
      var debtplayer = currentPlayers.find(e => e.money < 0);
      if (debtplayer) {
        topDisplayColor = "text-info";
        topDisplay = (
          <>
            <i>{debtplayer.name} </i>
            is in debt! Awaiting him to sell/mortgage...
          </>
        );
      }


      break;
  }

  if (UIState.currentTrade) {
    topDisplayColor = "text-info";
    topDisplay = (
      <p>
        <i> {UIState.currentTrade.tradeInitiator}</i>  wants to trade with <i>{UIState.currentTrade.tradeTarget}</i>
      </p>
    )

  }

  return (
    <>
      <div style={{
        position: "absolute", left: "0px", top: "0px", zIndex: 1,
        width: "100vw", justifyItems: "center", textAlign: "center",
        fontSize: "2.5vw"
      }} onContextMenu={(e) => { e.preventDefault() }}
        className={topDisplayColor}>
        {topDisplay}
      </div>

      <BottomDisplayEvents />

      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1, pointerEvents: "none" }}>
        <AnimatePresence>
          {
            UIState.currentAuction &&
            <motion.div
              onContextMenu={(e) => { e.preventDefault() }}
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
              onContextMenu={(e) => { e.preventDefault() }}
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
            props.displayDetailProperty !== null &&
            <motion.div
              onContextMenu={(e) => { e.preventDefault() }}
              style={{ zIndex: 1 }}

              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PropertyDetailsOverlay enabled={true} propertyID={props.displayDetailProperty} onHide={() => props.hideDetail()} />
            </motion.div>
          }
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {
          UIState.currentTrade &&
          <motion.div
            style={{ zIndex: 2 }}

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TradeOverlay state={UIState} />
          </motion.div>
        }
      </AnimatePresence>


      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1, pointerEvents: "none" }}>
        <AnimatePresence>
          {
            UIState.propertyToBuy && characterToStopped.get(currentPlayers[currentTurn].character) &&
            <motion.div
              onContextMenu={(e) => { e.preventDefault() }}
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

      <motion.div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1 }}
        whileHover={{ zIndex: 3 }}
      >
        <MultipleUserBars />
      </motion.div>

      <motion.div
        onContextMenu={(e) => { e.preventDefault() }}
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
      }}
      >
        <AnimatePresence>
          {
            isCurrentTurn && !isAnyDiceRolling &&
            props.displayDetailProperty === null && UIState.turnPhase === TurnPhase.Standby && !UIState.currentTrade &&
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