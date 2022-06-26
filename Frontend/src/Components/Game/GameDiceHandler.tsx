import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useReducer, useState } from 'react';
import { GameDice, throwValues } from "./GameDice";


const MaxDiceThrowVelocity = 2;
const MaxDiceOffsetPos = 0.1;


enum diceHandleAction {
  throwDices,
}

type diceHandleState = {
  renderDices: boolean,
  diceThrowParams: throwValues[],
}

type DiceResultState = (null | number)[];


function generateThrowValues(): throwValues {
  var velx = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var vely = Math.random();
  var velz = -(Math.random()) * MaxDiceThrowVelocity - 1.5;
  var offsetx = Math.random() * MaxDiceOffsetPos
  var offsety = Math.random() * MaxDiceOffsetPos
  var offsetz = Math.random() * MaxDiceOffsetPos
  return { velocity: [velx, vely, velz], offset: [offsetx, offsety, offsetz] }
}


type GameDiceHandlerProps = {
  nDices: number,
}

export interface HandlerRefObject {
  orderThrowDices: () => void
}


const dicePositions: [number, number, number][] = [[5, 3, 4.5], [4.5, 3, 5], [5, 3, 5], [5, 3, 3]]

export const GameDiceHandler = forwardRef((props: GameDiceHandlerProps, ref: Ref<HandlerRefObject>) => {
  const [performThrow, setPerformThrow] = useState(false);
  const [diceLanded, setDiceLanded] = useState<DiceResultState>(Array(props.nDices).fill(null));
  const [diceState, diceDispatcher] = useReducer(diceReducer, { renderDices: true, diceThrowParams: [] });

  // this is only necessary if you're doing functional components.
  useImperativeHandle(ref, () => ({
    orderThrowDices() {
      ThrowDices();
    },
  }));

  const ThrowDices = useCallback(() => {
    diceDispatcher(diceHandleAction.throwDices);
    setDiceLanded(Array(props.nDices).fill(null));
    setPerformThrow(true);
  }, [props.nDices])

  const onDiceLand = useCallback((landed: number) => {
    setDiceLanded(oldstate => {
      var idx = oldstate.findIndex((val) => val === null);
      var newstate = [...oldstate];
      newstate[idx] = landed;
      return newstate;
    })
  }, []);

  // automatically call when both dice have landed
  useEffect(() => {
    var idx = diceLanded.findIndex((val) => val === null);

    if (idx === -1) {
      console.log("All dice landed! " + diceLanded);
    }

  }, [ThrowDices, diceLanded])



  // NEVER modify state directly. Simply return new state using {...state} for example
  function diceReducer(state: diceHandleState, action: diceHandleAction): diceHandleState {
    switch (action) {
      case diceHandleAction.throwDices:

        var throwParams = Array(props.nDices).fill(0).map((val) => { return generateThrowValues() })
        return {
          diceThrowParams: throwParams,
          renderDices: true,
        }
      default:
        return state;
    }
  }

  var dices = diceState.diceThrowParams.map((throwParams, idx) =>
    <GameDice props={{ material: "dice", args: [0.3, 0.3, 0.3], position: dicePositions[idx] }}
      color="orange" throwParams={throwParams}
      display={diceState.renderDices} onStopCallback={onDiceLand}
      performThrow={performThrow} setPerformThrow={setPerformThrow} key={idx}
    // onStopTransform={{ position: [-6, 0, 3] }}

    />
  )

  return (
    <React.Fragment>
      {dices}
    </React.Fragment>
  )
});
