import { MaxDiceOffsetPos, MaxDiceThrowVelocity, DiceThrowValues, dicePositions, Transform } from "common/diceConstants";
import { useOnKeyDown } from "hooks/onKeydown";
import { useReducer, useEffect } from "react";
import { GameDice, DiceThrowState, diceReducer, DiceReducerAction } from "./GameDice";
import create from 'zustand'
import { produce } from "immer"

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
  diceFall: (idx: number, diceNumber: number, transform: Transform) => void;
  diceReset: () => void;
}

const useDiceCatch = create<DiceCatchedState>()((set) => ({
  diceCatchedNumbers: [undefined, undefined],
  diceStoppedTransforms: [undefined, undefined],
  diceFall: (idx: number, diceNumber: number, transform: Transform) =>
    set((diceState) => {
      return produce(diceState, (draft) => {
        draft.diceCatchedNumbers[idx] = diceNumber;
        draft.diceStoppedTransforms[idx] = transform;
      })
    }),
  diceReset: () => {
    set((e) => produce(e, (draft) => {
      const n_defined = e.diceCatchedNumbers.map(i => undefined);
      draft.diceCatchedNumbers = n_defined;
      draft.diceStoppedTransforms = n_defined;
    }))
  }
}))

export function GameDiceHandler() {
  const n_dices = 2;
  const n_array = Array(n_dices).fill(undefined);
  const diceCatches = useDiceCatch();

  const [diceStates, multiDispatcher] = useReducer(diceMultiReducer, n_array.map(e => diceInit))

  const onDiceLand = (diceIndexLand: number, diceLandNumber: number, transf: Transform) => {
    diceCatches.diceFall(diceIndexLand, diceLandNumber, transf)
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
    if (diceCatches.diceCatchedNumbers.every(e => e !== undefined)) {
      console.log("numbers are: ", diceCatches.diceCatchedNumbers)
      console.log("transforms, are:", diceCatches.diceStoppedTransforms)
    }
  }, [diceCatches])

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