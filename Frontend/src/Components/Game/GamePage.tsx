import { useRef } from 'react';
import { Canvas } from '@react-three/fiber'
import { CameraController } from "./CameraController";
import { Physics } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Gameboard";
import { GameDiceHandler, HandlerRefObject } from './GameDiceHandler';






export function Gamepage() {

  // const [throwDicesNotifier, notifyThrowDices] = useState(false)

  const gameDiceHandler = useRef<HandlerRefObject>(null);

  const ThrowDices = () => {
    // notifyThrowDices(true);
    if (gameDiceHandler.current !== null)
      gameDiceHandler.current.orderThrowDices();
  }

  return (
    // <div> cool game goes here </div>
    < div id="canvas-container" style={{ width: "100vw", height: "100vh" }} >
      <Canvas>
        <ambientLight intensity={0.3} />
        <directionalLight color="white" position={[30, 30, 0]} intensity={0.5} />
        <CameraController />

        <Physics>


          <GameBoard boxprops={{ material: "board", args: [10, 0.1, 10] }} color="blue" onClickCallback={ThrowDices} />

          <GameDiceHandler ref={gameDiceHandler} nDices={2} />

          <InvisiblePlane position={[0, -0.1, 0]} />
        </Physics>
      </Canvas>
    </div>
  )
}