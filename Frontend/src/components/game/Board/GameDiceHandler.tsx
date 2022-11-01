import { MaxDiceOffsetPos, MaxDiceThrowVelocity, DiceThrowValues, dicePositions, Transform } from "common/diceConstants";
import { useOnKeyDown } from "hooks/onKeydown";
import { useReducer, useEffect } from "react";
import { GameDice, DiceThrowState, diceReducer, DiceReducerAction } from "./GameDice";
import create from 'zustand'
import { produce } from "immer"
import { useUserSocket } from "hooks/socketProvider";
import { useSocketEvent } from "hooks/useSocketEvent";

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
  /** Whether dice is from current player or another remote player,
   * if it's not the dice player, no callback will be executed on stop */
  isLocalDice: boolean,
  diceFall: (idx: number, diceNumber: number, transform: Transform) => void;
  diceReset: () => void;
  setLocalDice: (isLocal: boolean) => void;
}

const useDiceCatch = create<DiceCatchedState>()((set) => ({
  isLocalDice: true,
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
  },
  setLocalDice: (isLocal: boolean) => {
    set((e) => produce(e, (draft) => {
      // reset to undefined
      const n_defined = e.diceCatchedNumbers.map(i => undefined);
      draft.diceCatchedNumbers = n_defined;
      draft.diceStoppedTransforms = n_defined;
      // AND also set local
      draft.isLocalDice = isLocal;
    }))
  }
}))


// const mystaticthrowval = generateThrowValues();

export function GameDiceHandler() {
  const n_dices = 2;
  const n_array = Array(n_dices).fill(undefined);
  const diceCatches = useDiceCatch();
  const userSocket = useUserSocket()
  const [diceStates, multiDispatcher] = useReducer(diceMultiReducer, n_array.map(e => diceInit))

  const onDiceLand = (diceIndexLand: number, diceLandNumber: number, transf: Transform) => {
    diceCatches.diceFall(diceIndexLand, diceLandNumber, transf)
  }


  useSocketEvent("throw-dice-start", (payload) => {
    diceCatches.setLocalDice(false);
    const recv = payload as { throwValues: DiceThrowValues[] }
    throwAllDices(recv.throwValues);
    console.log("Start: ", payload)
  });

  useSocketEvent("throw-dice-finish", (payload) => {
    console.log("Finish: ", payload)
    // payload.dicesStop.forEach((e: any) => { e.rotation.push("XYZ") })
    payload.dicesStop.forEach((transform: any, i: number) => {
      multiDispatcher({ action: { action: "fake-dice", standbyTransform: transform }, targetIndex: i })
    })

  });

  const throwAllDices = (throwValues: DiceThrowValues[]) => {
    n_array.forEach((e, i) => {
      var action: DiceReducerAction = {
        action: "throw-dice", throwForce: throwValues[i],
        throwPosition: dicePositions[i],
        onStopCallback: (n: number, transf: Transform) => { onDiceLand(i, n, transf) }
      }

      multiDispatcher({ action: action, targetIndex: i })
    })
  };

  const performDiceLocally = () => {
    const throwVals = n_array.map(e => generateThrowValues());

    diceCatches.setLocalDice(true);
    userSocket.emit("throw-dice-start", { throwValues: throwVals })
    throwAllDices(throwVals);
  }

  useOnKeyDown("f", () => {
    performDiceLocally();
  });

  useEffect(() => {
    if (diceCatches.diceCatchedNumbers.every(e => e !== undefined) && diceCatches.isLocalDice) {
      diceCatches.diceReset();
      const transforms = produce(diceCatches.diceStoppedTransforms, (draft) => {
        draft.forEach(diceTransform => {
          if (diceTransform) {
            diceTransform.rotation.splice(3, 1)
          }
        })
      }); // remove XYZ thing from rotation

      userSocket.emit("throw-dice-finish",
        {
          diceLanded: diceCatches.diceCatchedNumbers,
          dicesStop: transforms,
        }
      )
    }
  }, [diceCatches, userSocket])

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