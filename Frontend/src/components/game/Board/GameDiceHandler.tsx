import { MaxDiceOffsetPos, MaxDiceThrowVelocity, DiceThrowValues, dicePositions } from "common/diceConstants";
import { useOnKeyDown } from "hooks/onKeydown";
import { useReducer, useState } from "react";
import { GameDice, DiceThrowState, diceReducer, DiceReducerAction } from "./GameDice";



function generateThrowValues(): DiceThrowValues {
  var velx = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var vely = Math.random();
  var velz = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var offsetx = Math.random() * MaxDiceOffsetPos
  var offsety = Math.random() * MaxDiceOffsetPos
  var offsetz = Math.random() * MaxDiceOffsetPos
  return { velocity: [velx, vely, velz], offset: [offsetx, offsety, offsetz] }
}

const diceInit: DiceThrowState = {
  shouldRoll: false,
  throwPosition: [0, 0, 0],
  isRolling: true,
  throwForce: { velocity: [0, 0, 0], offset: [0, 0, 0] },
  onStopCallback: () => { },
  display: true,
}

type DiceMultiAction = {
  action: DiceReducerAction
  targetIndex: number
}

function diceMultiReducer(states: DiceThrowState[], action: DiceMultiAction): DiceThrowState[] {
  const newState = [...states];
  newState[action.targetIndex] = diceReducer(states[action.targetIndex], action.action)
  return newState
}


export function GameDiceHandler() {
  const [diceThrown, updateDiceRolling] = useState<(number | undefined)[]>([undefined, undefined]);

  const [diceStates, multiDispatcher] = useReducer(diceMultiReducer, diceThrown.map(e => diceInit))

  const onDiceLand = (diceIndexLand: number, diceLandNumber: number) => {
    console.log(`Dice ${diceIndexLand}, landed on number: ${diceLandNumber}`)
    updateDiceRolling(e => {
      const e2 = [...e];
      e2[diceIndexLand] = diceLandNumber;
      return e2;
    })
  }

  const throwAllDices = () => {
    diceThrown.forEach((e, i) => {
      var action: DiceReducerAction = {
        action: "throw-dice", throwForce: generateThrowValues(),
        throwPosition: dicePositions[i],
        onStopCallback: (n: number) => { onDiceLand(i, n) }
      }

      multiDispatcher({ action: action, targetIndex: i })
    })
  };

  useOnKeyDown("f", () => {
    throwAllDices();
  });

  // useOnKeyDown("c", () => {
  //   // hack dice on position
  //   var action: DiceReducerAction = { action: "fake-dice", standbyTransform: { position: [1, 0.3, 1], rotation: [2, 3, 1] } }
  //   multiDispatcher({ action: action, targetIndex: 0 })
  // })

  const dices = diceThrown.map((e, i) =>
    <GameDice
      key={"dice-" + i}
      throwingDispatch={(action: DiceReducerAction) => { multiDispatcher({ action: action, targetIndex: i }) }}
      throwingState={diceStates[i]}
    />
  )

  return (
    <>
      {dices}
    </>
  )
}