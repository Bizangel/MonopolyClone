import React, { useState } from "react";
import { useRef } from 'react';
import { Canvas, } from '@react-three/fiber'
import { CameraController, CameraRefObject } from "components/game/Board/CameraController";
import { Physics } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Board/Gameboard";
import { PlayerModelHandler } from './Player/PlayerModelHandler';
import { UI } from './UI/UI';
import { GameDiceHandler } from "./Board/GameDiceHandler";
import { boardYLocation } from "common/boardConstants";
import { tileToPropertyID } from "common/propertiesMapping";
import { GameHouseHandler } from "./Board/GameHouseHandler";
import { JailCage } from "./Board/JailCage";
import { SkyboxHandler } from "./Skybox/SkyboxHandler";

/**
 * Main gamepage containing all game display 3d stuff.
 * Including monopoly board etc
 */
export function Gamepage() {
  const cameraController = useRef<CameraRefObject>(null);
  const [displayDetail, setDisplayDetail] = useState<number | null>(null);
  const [shouldAllowDetails, setShouldAllowDetails] = useState(false);

  const onTileClick = (tileIndex: number) => {
    var tile = tileToPropertyID.get(tileIndex);
    if (tile !== undefined && shouldAllowDetails) {
      setDisplayDetail(tile);
    }
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

          <GameHouseHandler />
          <GameDiceHandler />

          <JailCage />
          <SkyboxHandler bg={"forest"} />
          <InvisiblePlane position={[0, boardYLocation, 0]} />
        </Physics>
      </Canvas>

      <UI displayDetailProperty={displayDetail}
        shouldAllowDetails={shouldAllowDetails} setShouldAllowDetails={setShouldAllowDetails}
        hideDetail={() => setDisplayDetail(null)} />
    </div>
  )
}