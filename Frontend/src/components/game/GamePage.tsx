import React from "react";
import { useRef } from 'react';
import { Canvas, } from '@react-three/fiber'
import { CameraController, CameraRefObject } from "components/game/Board/CameraController";
import { Physics } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Board/Gameboard";
import { PlayerModelHandler } from './Player/PlayerModelHandler';
import { UI } from './UI/UI';
import { GameDiceHandler } from "./Board/GameDiceHandler";
import { boardYLocation } from "common/boardConstants";
import { useSocketEvent } from "hooks/useSocketEvent";
import { GameTileHouse } from "./Board/GameTileHouse";


/**
 * Main gamepage containing all game display 3d stuff.
 * Including monopoly board etc
 */
export function Gamepage() {
  const cameraController = useRef<CameraRefObject>(null);

  useSocketEvent("testEvent", (payload) => {
    console.log("Received test event:!", payload)
  })

  const onTileClick = (tileIndex: number) => {
    console.log("clicked tile:", tileIndex)
  }

  return (

    < div id="canvas-container" style={{ width: "100vw", height: "100vh", userSelect: "none" }} >
      <Canvas style={{ zIndex: 0, position: "absolute" }}>
        <ambientLight intensity={0.4} color="white" />
        <directionalLight color="white" position={[30, 30, 0]} intensity={0.2} />
        <CameraController ref={cameraController} initialLookatLocation={[0, 0, 0]} initialPos={[0, 5, 5]} />


        <Physics>
          <PlayerModelHandler />

          <GameBoard color="blue" onTileClicked={onTileClick} />

          <GameTileHouse position={[2.8, 0, 4]} />
          <GameTileHouse position={[3.0, 0, 4]} />
          <GameTileHouse position={[3.2, 0, 4]} />
          <GameTileHouse position={[3.4, 0, 4]} />

          <GameDiceHandler />
          <InvisiblePlane position={[0, boardYLocation, 0]} />
        </Physics>
      </Canvas>

      <UI />
    </div>
  )
}