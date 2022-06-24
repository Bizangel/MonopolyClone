// import { useCallback, useState } from "react"
import { Canvas } from '@react-three/fiber'
import { CameraController } from "./CameraController";

import { Physics } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Gameboard";
import { GameDice } from "./GameDice";



export function Gamepage() {

  // const [reset, doResetDice] = useState(true);

  // const onClickBoard = useCallback(() => {
  //   console.log("clicky!")
  //   doResetDice(prev => !prev);
  // }, []);



  return (
    // <div> cool game goes here </div>
    < div id="canvas-container" style={{ width: "100vw", height: "100vh" }} >
      <Canvas>
        <ambientLight intensity={0.3} />
        <directionalLight color="yellow" position={[0, 100, 0]} />
        <CameraController />

        <Physics>
          <GameDice props={{ material: "dice", args: [0.3, 0.3, 0.3], position: [5, 3, 4.5] }} color="orange" />
          <GameDice props={{ material: "dice", args: [0.3, 0.3, 0.3], position: [4.5, 3, 5] }} color="orange" />

          <GameBoard boxprops={{ material: "board", args: [10, 0.1, 10] }} color="blue" />

          <InvisiblePlane position={[0, -0.1, 0]} />
        </Physics>
      </Canvas>
    </div>
  )
}