import { MaxDiceOffsetPos, MaxDiceThrowVelocity, DiceThrowValues, dicePositions, Transform } from "common/diceConstants";
import { useOnKeyDown } from "hooks/onKeydown";
import { useReducer, useEffect } from "react";
import { GameDice, DiceThrowState, diceReducer, DiceReducerAction } from "./GameDice";
// import create from 'zustand'

// =======================
// Throwing Dices Reducer
// Logic Action and States
// =======================

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


// =======================
// Catching Dices, as in obtaining their state after throw
// Logic Action and States
// =======================

type DiceCatchedState = {
  diceCatchedNumbers: (number | undefined)[]
  diceStoppedTransforms: (Transform | undefined)[],
}

type DiceCatchOnStopAction = {
  action: "catch-dice",
  diceCatchedNumber: number,
  diceCatchedTransform: Transform,
  diceCatchedIndex: number,
}

type DiceCatchInternalStopAction = {
  action: "catch-stop-reset",
}


type DiceCatchAction = DiceCatchOnStopAction | DiceCatchInternalStopAction


function diceCatcherReducer(state: DiceCatchedState, action: DiceCatchAction): DiceCatchedState {
  switch (action.action) {
    case "catch-dice":
      const transforms = [...state.diceStoppedTransforms];
      const numbers = [...state.diceCatchedNumbers];
      numbers[action.diceCatchedIndex] = action.diceCatchedNumber
      transforms[action.diceCatchedIndex] = action.diceCatchedTransform
      return { diceStoppedTransforms: transforms, diceCatchedNumbers: numbers }
    case "catch-stop-reset":
      const n_undefined = state.diceCatchedNumbers.map(e => undefined)
      return { diceCatchedNumbers: n_undefined, diceStoppedTransforms: n_undefined }
  }
}

export function GameDiceHandler() {
  const n_dices = 2;
  const n_array = Array(n_dices).fill(undefined);
  const [diceThrown, catchDices] = useReducer(diceCatcherReducer,
    {
      diceCatchedNumbers: n_array, diceStoppedTransforms: n_array
    });

  const [diceStates, multiDispatcher] = useReducer(diceMultiReducer, n_array.map(e => diceInit))

  const onDiceLand = (diceIndexLand: number, diceLandNumber: number, transf: Transform) => {
    catchDices({
      action: "catch-dice",
      diceCatchedIndex: diceIndexLand,
      diceCatchedTransform: transf, diceCatchedNumber: diceLandNumber
    })
  }

  const throwAllDices = () => {
    n_array.forEach((e, i) => {
      var action: DiceReducerAction = {
        action: "throw-dice", throwForce: generateThrowValues(),
        throwPosition: dicePositions[i],
        onStopCallback: (n: number, transf: Transform) => { onDiceLand(i, n, transf) }
      }

      multiDispatcher({ action: action, targetIndex: i })
    })
  };

  useOnKeyDown("f", () => {
    throwAllDices();
  });

  useEffect(() => {
    if (diceThrown.diceCatchedNumbers.every(e => e !== undefined)) {
      console.log("numbers are: ", diceThrown.diceCatchedNumbers)
      console.log("transforms, are:", diceThrown.diceStoppedTransforms)
      catchDices({ action: "catch-stop-reset" })
    }
  }, [diceThrown])

  const dices = n_array.map((e, i) =>
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