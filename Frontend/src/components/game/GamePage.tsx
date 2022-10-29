import React, { useEffect } from "react";
import { useContext, useRef } from 'react';
import { Canvas, } from '@react-three/fiber'
import { CameraController, CameraRefObject } from "components/game/Board/CameraController";
import { Physics } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Board/Gameboard";
import { PlayerModelHandler } from './Player/PlayerModelHandler';
import { playerHandlerContext } from '../../gamehandlers/PlayerHandler';
import { PlayerCharacter } from 'common/characterModelConstants';
import { useRenderTrigger } from 'hooks';
import { UI } from './UI/UI';
import { GameDiceHandler } from "./Board/GameDiceHandler";
import { boardYLocation } from "common/boardConstants";
import { UserSocket } from "gamehandlers/socketEvents";



export function Gamepage() {
  const playerHandler = useContext(playerHandlerContext);
  const triggerRender = useRenderTrigger();
  const cameraController = useRef<CameraRefObject>(null);

  const userSocket = useRef(new UserSocket()); // shouldn't be like this

  useEffect(
    () => {
      var socket = userSocket.current;
      socket.Initialize();
      return () => { socket.Close() }
    }
    , []);


  if (playerHandler.playerLocations.size === 0) {
    playerHandler.registerPlayer([
      {
        username: "carplayer",
        character: PlayerCharacter.Car,
      },
      {
        username: "shipplayer",
        character: PlayerCharacter.Ship,
      },
    ]);
  }


  const onTileClick = (tileIndex: number) => {
    playerHandler.updatePlayersLocations([
      { character: PlayerCharacter.Car, location: tileIndex },
      { character: PlayerCharacter.Ship, location: tileIndex },
    ]);
    triggerRender();
  }

  return (

    < div id="canvas-container" style={{ width: "100vw", height: "100vh" }}>

      <UI />
      <Canvas>
        <ambientLight intensity={0.4} color="white" />
        <directionalLight color="white" position={[30, 30, 0]} intensity={0.2} />
        <CameraController ref={cameraController} initialLookatLocation={[0, 0, 0]} initialPos={[0, 5, 5]} />


        <Physics>
          <PlayerModelHandler locations={playerHandler.playerLocations} />

          <GameBoard color="blue" onTileClicked={onTileClick} />

          {/* <GameDiceHandler ref={gameDiceHandler} nDices={2} /> */}

          <GameDiceHandler />
          <InvisiblePlane position={[0, boardYLocation, 0]} />
        </Physics>
      </Canvas>
    </div>
  )
}