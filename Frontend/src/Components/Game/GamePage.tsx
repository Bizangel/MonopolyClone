import { useContext, useRef } from 'react';
import { Canvas, } from '@react-three/fiber'
import { CameraController, CameraRefObject } from "../Helpers/CameraController";
import { Physics } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Board/Gameboard";
import { GameDiceHandler, HandlerRefObject } from './Board/GameDiceHandler';
import { PlayerModelHandler } from './Player/PlayerModelHandler';
import { playerHandlerContext } from '../../Game/PlayerHandler';
import { PlayerCharacter } from './Player/PlayerCharacterCommons';
import { useRenderTrigger } from '../Helpers/customHooks';


export function Gamepage() {
  const playerHandler = useContext(playerHandlerContext);
  const triggerRender = useRenderTrigger();
  const gameDiceHandler = useRef<HandlerRefObject>(null);
  const cameraController = useRef<CameraRefObject>(null);

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
      {
        username: "ironplayer",
        character: PlayerCharacter.Iron,
      },
      {
        username: "ddd",
        character: PlayerCharacter.Hat,
      },
      {
        username: "dd",
        character: PlayerCharacter.Thimble,
      },
      {
        username: "d",
        character: PlayerCharacter.Wheelcart,
      },
    ]);
  }


  const onTileClick = (tileIndex: number) => {
    playerHandler.updatePlayersLocations([
      { character: PlayerCharacter.Car, location: tileIndex },
      { character: PlayerCharacter.Ship, location: tileIndex - 1 },
      { character: PlayerCharacter.Iron, location: tileIndex - 2 },
      { character: PlayerCharacter.Hat, location: tileIndex - 3 },
      { character: PlayerCharacter.Thimble, location: tileIndex - 4 },
      { character: PlayerCharacter.Wheelcart, location: tileIndex - 5 },
    ]);
    triggerRender()
  }

  return (
    // <div> cool game goes here </div>
    < div id="canvas-container" style={{ width: "100vw", height: "100vh" }} >

      <Canvas>
        <ambientLight intensity={0.2} />
        <directionalLight color="white" position={[30, 30, 0]} intensity={0.5} />
        <CameraController ref={cameraController} initialLookatLocation={[0, 0, 0]} initialPos={[0, 5, 5]} />

        <Physics>
          <PlayerModelHandler locations={playerHandler.playerLocations} />

          <GameBoard color="blue" onTileClicked={onTileClick} />

          <GameDiceHandler ref={gameDiceHandler} nDices={2} />

          <InvisiblePlane position={[0, -0.1, 0]} />
        </Physics>
      </Canvas>
    </div>
  )
}