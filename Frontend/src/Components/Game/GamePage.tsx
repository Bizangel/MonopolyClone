import { useRef } from 'react';
import { Canvas } from '@react-three/fiber'
import { CameraController } from "../Helpers/CameraController";
import { Physics } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Board/Gameboard";
import { GameDiceHandler, HandlerRefObject } from './Board/GameDiceHandler';
import { PlayerModelHandler } from './Player/PlayerModelHandler';

// PlayerModel


// import { Point, Points } from '@react-three/drei';
// import { getMidPoint, tileToWorldLocation } from '../../common/boardhelpers';



export function Gamepage() {

  // const [throwDicesNotifier, notifyThrowDices] = useState(false)

  const gameDiceHandler = useRef<HandlerRefObject>(null);

  const onTileClick = (tileIndex: number) => {
    // gameDiceHandler.current?.orderThrowDices();
    console.log("Clicked on tile: " + tileIndex)
  }



  // var ptsloc = tileToWorldLocation(0);
  // var midpoint = getMidPoint(ptsloc);

  return (
    // <div> cool game goes here </div>
    < div id="canvas-container" style={{ width: "100vw", height: "100vh" }} >

      <Canvas>
        <ambientLight intensity={0.3} />
        <directionalLight color="white" position={[30, 30, 0]} intensity={0.5} />
        <CameraController initialPos={[0, 6, 6]} initialLookatLocation={[0, 0, 0]} />


        {/* <Points
          limit={1000} // Optional: max amount of items (for calculating buffer size)
          range={1000} // Optional: draw-range
        >

          <pointsMaterial vertexColors size={0.2} />
          <Point scale={0.05} position={[ptsloc.botleft.x, ptsloc.botleft.y, ptsloc.botleft.z]} color="red" />

          <pointsMaterial vertexColors size={0.2} />
          <Point scale={0.05} position={[ptsloc.botright.x, ptsloc.botright.y, ptsloc.botright.z]} color="orange" />

          <pointsMaterial vertexColors size={0.2} />
          <Point scale={0.05} position={[ptsloc.topright.x, ptsloc.topright.y, ptsloc.topright.z]} color="lightgreen" />

          <pointsMaterial vertexColors size={0.2} />
          <Point scale={0.05} position={[ptsloc.topleft.x, ptsloc.topleft.y, ptsloc.topleft.z]} color="green" />

          <pointsMaterial vertexColors size={0.2} />
          <Point scale={0.05} position={[midpoint.x, midpoint.y, midpoint.z]} color="blue" />

        </Points> */}

        <Physics>
          <PlayerModelHandler position={10} />

          <GameBoard color="blue" onTileClicked={onTileClick} />

          <GameDiceHandler ref={gameDiceHandler} nDices={2} />

          <InvisiblePlane position={[0, -0.1, 0]} />
        </Physics>
      </Canvas>
    </div>
  )
}