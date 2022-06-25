// import { useCallback, useState } from "react"
import { Canvas } from '@react-three/fiber'
import { CameraController } from "./CameraController";

import { Physics, Triplet } from '@react-three/cannon'
import { GameBoard, InvisiblePlane } from "./Gameboard";
import { GameDice } from "./GameDice";
import { useCallback, useReducer, useState } from 'react';


enum diceHandleAction {
  throwDices = 1
}


type diceHandleState = {
  diceARender: boolean,
  diceBRender: boolean,
  throwForceA: Triplet,
  throwForceB: Triplet,
  throwOffsetA: Triplet,
  throwOffsetB: Triplet,
}


// NEVER modify state directly. Simply return new state using {...state} for example
function diceReducer(state: diceHandleState, action: diceHandleAction): diceHandleState {
  switch (action) {
    case diceHandleAction.throwDices:
      const throwA = generateThrowValues();
      const throwB = generateThrowValues();

      return {
        ...state,
        throwForceA: throwA.velocity, throwForceB: throwB.velocity,
        throwOffsetA: throwA.offset, throwOffsetB: throwB.offset,
        diceARender: true, diceBRender: true,
      }

    default:
      return state;
  }

}

const MaxDiceThrowVelocity = 2;
const MaxDiceOffsetPos = 0.1;


function generateThrowValues(): { velocity: Triplet, offset: Triplet } {
  var velx = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var vely = Math.random();
  var velz = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var offsetx = Math.random() * MaxDiceOffsetPos
  var offsety = Math.random() * MaxDiceOffsetPos
  var offsetz = Math.random() * MaxDiceOffsetPos

  return { velocity: [velx, vely, velz], offset: [offsetx, offsety, offsetz] }
}


export function Gamepage() {

  const [diceState, diceDispatcher] = useReducer(diceReducer, {
    diceARender: false, diceBRender: false,
    throwForceA: [0, 0, 0], throwForceB: [0, 0, 0], throwOffsetA: [0, 0, 0], throwOffsetB: [0, 0, 0]
  });

  const [resetDiceVal, resetDice] = useState(false);

  const ThrowDices = useCallback(() => {
    diceDispatcher(diceHandleAction.throwDices);
    resetDice(val => !val);
  }, [])

  function clickity() {
    console.log("clickity")
  }

  return (
    // <div> cool game goes here </div>
    < div id="canvas-container" style={{ width: "100vw", height: "100vh" }} >
      <Canvas>
        <ambientLight intensity={0.3} />
        <directionalLight color="white" position={[30, 30, 0]} intensity={0.5} />
        <CameraController />

        <Physics>
          <GameDice props={{ material: "dice", args: [0.3, 0.3, 0.3], position: [5, 3, 4.5] }}
            color="orange" resetCaller={resetDiceVal} throwForce={diceState.throwForceA} throwOffset={diceState.throwOffsetA}
            display={diceState.diceARender} onStopCallback={clickity}
          />;
          <GameDice props={{ material: "dice", args: [0.3, 0.3, 0.3], position: [4.5, 3, 5] }}
            color="orange" resetCaller={resetDiceVal} throwForce={diceState.throwForceB} throwOffset={diceState.throwOffsetB}
            display={diceState.diceBRender} onStopCallback={clickity} />;

          <GameBoard boxprops={{ material: "board", args: [10, 0.1, 10] }} color="blue" onClickCallback={ThrowDices} />

          <InvisiblePlane position={[0, -0.1, 0]} />
        </Physics>
      </Canvas>
    </div>
  )
}