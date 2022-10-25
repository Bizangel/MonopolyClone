import { MaxDiceOffsetPos, MaxDiceThrowVelocity, DiceThrowValues } from "common/diceConstants";
import { useOnKeyDown } from "hooks/onKeydown";
import { useReducer } from "react";
import { GameDice, DiceThrowState, diceReducer } from "./GameDice";



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
  isRolling: true,
  throwForce: { velocity: [0, 0, 0], offset: [0, 0, 0] },
  onStopCallback: () => { },
  display: true,
}

export function GameDiceHandler() {
  const [diceState, diceDispatcher] = useReducer(diceReducer, diceInit)
  // const [throwDiceWatcher, setThrowDice] = useState(false);

  // debug
  useOnKeyDown("f", () => {
    console.log("F pressed")
    diceDispatcher({
      action: "throw-dice", throwForce: generateThrowValues(),
      onStopCallback: (n: number) => { console.log("dice landed on: ", n) }
    })
  });

  return (
    <GameDice
      throwingDispatch={diceDispatcher}
      throwingState={diceState}
    />)
}