import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useReducer, useState } from 'react';
import { Triplet } from '@react-three/cannon'
import { GameDice } from "./GameDice";


const MaxDiceThrowVelocity = 2;
const MaxDiceOffsetPos = 0.1;


enum diceHandleAction {
  throwDices,
}

type diceHandleState = {
  diceARender: boolean,
  diceBRender: boolean,
  throwForceA: Triplet,
  throwForceB: Triplet,
  throwOffsetA: Triplet,
  throwOffsetB: Triplet,
}

type DiceResultState = [null | number, null | number];


function generateThrowValues(): { velocity: Triplet, offset: Triplet } {
  var velx = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var vely = Math.random();
  var velz = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var offsetx = Math.random() * MaxDiceOffsetPos
  var offsety = Math.random() * MaxDiceOffsetPos
  var offsetz = Math.random() * MaxDiceOffsetPos

  // var velx = -(0.5) * MaxDiceThrowVelocity - 1.5;
  // var vely = 0.5;
  // var velz = -(0.5) * MaxDiceThrowVelocity - 1.5;
  // var offsetx = 0.5 * MaxDiceOffsetPos
  // var offsety = 0.5 * MaxDiceOffsetPos
  // var offsetz = 0.5 * MaxDiceOffsetPos


  return { velocity: [velx, vely, velz], offset: [offsetx, offsety, offsetz] }
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


type GameDiceHandlerProps = {
  throwDices?: { watchable: boolean, setter: React.Dispatch<React.SetStateAction<boolean>> },
}


export interface HandlerRefObject {
  orderThrowDices: () => void
}

export const GameDiceHandler = forwardRef((props: GameDiceHandlerProps, ref: Ref<HandlerRefObject>) => {
  const [performThrow, setPerformThrow] = useState(false);
  const [diceLanded, setDiceLanded] = useState<DiceResultState>([null, null]);
  const [diceState, diceDispatcher] = useReducer(diceReducer, {
    diceARender: false, diceBRender: false,
    throwForceA: [0, 0, 0], throwForceB: [0, 0, 0], throwOffsetA: [0, 0, 0], throwOffsetB: [0, 0, 0]
  });

  // this is only necessary if you're doing functional components.
  useImperativeHandle(ref, () => ({
    orderThrowDices() {
      ThrowDices();
    },
  }));

  const ThrowDices = useCallback(() => {
    diceDispatcher(diceHandleAction.throwDices);
    setDiceLanded([null, null]);
    setPerformThrow(val => true);
  }, [])

  const onDiceLand = useCallback((landed: number) => {
    if (diceLanded[0] == null) {
      setDiceLanded(val => [landed, val[1]]);
    } else if (diceLanded[1] == null) {
      setDiceLanded(val => [val[0], landed]);
    }
  }, [diceLanded]);


  // automatically throw dices when requested
  // useEffect(() => {
  //   if (props.throwDices?.watchable === true) {
  //     ThrowDices();
  //     props.throwDices.setter(false);
  //   }

  // }, [props.throwDices, ThrowDices])

  // automatically call when both dice have landed
  useEffect(() => {
    if (diceLanded[0] != null && diceLanded[1] != null) {
      // var n1 = diceLanded[0];
      // var n2 = diceLanded[1];

      console.log("both dice landed! " + diceLanded);

      setDiceLanded([null, null])
    }
  }, [diceLanded, ThrowDices])



  return (
    <React.Fragment>
      <GameDice props={{ material: "dice", args: [0.3, 0.3, 0.3], position: [5, 3, 4.5] }}
        color="orange" throwForce={diceState.throwForceA} throwOffset={diceState.throwOffsetA}
        display={diceState.diceARender} onStopCallback={onDiceLand}
        performThrow={performThrow} setPerformThrow={setPerformThrow}
        onStopTransform={{ position: [-6, 0, 3] }}
      />
      <GameDice props={{ material: "dice", args: [0.3, 0.3, 0.3], position: [4.5, 3, 5] }}
        color="orange" throwForce={diceState.throwForceB} throwOffset={diceState.throwOffsetB}
        display={diceState.diceBRender} onStopCallback={onDiceLand}
        performThrow={performThrow} setPerformThrow={setPerformThrow}
        onStopTransform={{ position: [-6, 0, 4] }} />
    </React.Fragment>
  )
});
