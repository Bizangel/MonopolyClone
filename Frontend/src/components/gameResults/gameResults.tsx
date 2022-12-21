import { useState, useEffect } from "react";
import { UserBar } from "components/game/UI/UserBar/UserBar";
import { GameResult } from "gameState/gameResult";
import { Col, Container, Row } from "react-bootstrap";
import { AnimatePresence, motion } from "framer-motion"
import { MoneyImgTag } from "common/common";
import { AnimatedNumberDiv } from "components/helpers/AnimatedNumberDiv";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { GameBoard } from "components/game/Board/Gameboard";
import { StaticRotatingCamera } from "components/game/Board/StaticRotatingCamera";
import { Player } from "gameState/gameState";

const MotionRow = motion(Row);

function ResultTopDisplay(props: { winner?: string }) {
  return (
    <div style={{ position: "absolute", top: 0, fontSize: "4vh", width: "100%", left: 0, textAlign: "center" }} className="text-primary">
      The winner is <i>{props.winner}</i>
    </div>
  )
}

function ResultBottomDisplay(props: { winner?: string }) {
  return (
    <div style={{ position: "absolute", bottom: 0, fontSize: "4vh", width: "100%", left: 0, textAlign: "center" }} className="text-primary">
      Thanks for playing. <a href="https://github.com/Bizangel/MonopolyClone" target="_blank" rel="noreferrer"> See the code</a>
    </div>
  )
}

function MiddleDisplay() {
  return (
    <div style={{
      position: "absolute", bottom: 0, fontSize: "10vh", width: "100%", height: "100%",
      left: 0, textAlign: "center", alignItems: "middle", display: "flex"
    }}
      className="text-primary p-0 m-0">
      Game Results
    </div>
  )
}

function PlayerResultEntry(props: { player: Player, netWorth: number, podiumNumber: number }) {

  var windowoffset = window.innerHeight + 300;

  return (
    <MotionRow className="w-100 d-flex justify-content-center"
      initial={{
        transform: `translateY(-${windowoffset}px)`
      }}

      animate={{
        transform: "translateY(0px)"
      }}

      transition={{
        transform: { delay: 0.4, duration: 3, type: "spring", stiffness: 100 }
      }}
    >
      <Col className="d-flex align-items-center justify-content-end text-primary" style={{ fontSize: "3.5vh" }}>
        {props.podiumNumber}.
      </Col>
      <Col className="d-flex">
        <UserBar username={props.player.name} character={props.player.character} money={props.player.money.toFixed(0)}
          ownedProperties={props.player.properties} isDced={false} disablePropertyAnimate
        />
      </Col>
      <Col className="d-flex align-items-center justify-content-start text-info">
        Net Worth:
        <span className="justify-content-center align-items-center d-flex" style={{ fontSize: "3.5vh" }}>
          <AnimatedNumberDiv value={props.netWorth} durationSeconds={7} /> <MoneyImgTag scale={2} /></span>
      </Col>
    </MotionRow>
  )
}

export function GameResultPage(props: { results: GameResult }) {

  const [currentlyDisplayed, setCurrentlyDisplayed] = useState<{ player: Player, netWorth: number }[]>([]);
  const [hasFinishedDisplay, setHasFinishedDisplay] = useState(false);

  var sortedIndexes = Array.from(Array(props.results.netWorth.length).keys())
    .sort((a, b) => props.results.netWorth[a] - props.results.netWorth[b])

  const sortedResults = sortedIndexes.map(e => {
    return {
      player: props.results.players[e],
      netWorth: props.results.netWorth[e],
    }
  });

  useEffect(() => { // yes this is recurisve
    if (currentlyDisplayed.length === props.results.players.length) {
      setHasFinishedDisplay(true);
      return;
    }

    const timeOutID = setTimeout(() => {
      setCurrentlyDisplayed(e => {
        var newArray = [sortedResults[e.length], ...e];
        // newArray.push()
        return newArray;
      })
    }, 7000);

    return () => {
      clearTimeout(timeOutID);
    }

  }, [currentlyDisplayed, setCurrentlyDisplayed, sortedResults, props.results.players.length]);

  return (
    <>
      <Canvas style={{ zIndex: 0, position: "absolute", filter: "blur(5px)" }}>
        <ambientLight intensity={0.4} color="white" />
        <directionalLight color="white" position={[30, 30, 0]} intensity={0.2} />

        <StaticRotatingCamera initialLookatLocation={[0, 0, 0]} initialPos={[0, 6, 8]} />
        <Physics>
          <GameBoard color="blue" onTileClicked={() => { }} position={[-1, -1, 0]} />
        </Physics>
      </Canvas>

      <AnimatePresence>
        {
          currentlyDisplayed.length === 0 &&
          <motion.div
            onContextMenu={(e) => { e.preventDefault() }}
            style={{ zIndex: 1 }}

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <MiddleDisplay />
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {
          hasFinishedDisplay &&
          <motion.div
            onContextMenu={(e) => { e.preventDefault() }}
            style={{ zIndex: 1 }}

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
          >

            <ResultTopDisplay winner={sortedResults.at(-1)?.player.name} />
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {
          hasFinishedDisplay &&
          <motion.div
            onContextMenu={(e) => { e.preventDefault() }}
            style={{ zIndex: 1 }}

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
          >

            <ResultBottomDisplay />
          </motion.div>
        }
      </AnimatePresence>


      <Container className="d-flex justify-content-center align-items-center g-0 p-0 m-0" style={{ width: "100vw", height: "100vh" }}>
        <Col>
          {currentlyDisplayed.map((e, i) =>
            <PlayerResultEntry key={e.player.name} player={e.player} netWorth={e.netWorth}
              podiumNumber={props.results.players.length - (currentlyDisplayed.length - i - 1)} />
          )}
        </Col>
      </Container >
    </>
  )
}