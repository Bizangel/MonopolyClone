import { BoxProps, PublicApi, Triplet, useBox } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import React, { useCallback, useEffect, useRef } from "react";
import { Mesh, MeshStandardMaterial, TextureLoader } from "three";
import { Quaternion } from "cannon-es"
import {
  dice1, dice2, dice3, dice4, dice5, dice6, diceSize,
  diceStopVelocityThreshold, dirVectors, LocalDirectionUp, DiceThrowValues, diceMass, Transform, diceMaterial
} from 'common/diceConstants'
import { cosineSimilarity, tripletLength } from "utils/vectormath";



export type DiceThrowState = {
  /** If true, dice should be rolling and will be put to roll on next update */
  shouldRoll: boolean,
  /** Whether dice is Rolling or not. */
  isRolling: boolean,
  /** Current dice throw force, or the force that the dice was thrown with */
  throwForce: DiceThrowValues,
  /** Current original thrown dice position */
  throwPosition: Triplet,
  /** Function to call once dice stops rolling */
  onStopCallback: (n: number) => void,
  /** Transform that the dice should take once it is not rolling */
  standbyTransform?: Transform,
  /** Whether the dice is displayed or not */
  display: boolean,
};

type ThrowDiceAction = {
  action: "throw-dice",
  /** Force to use to throw the dice */
  throwForce: DiceThrowValues,
  /** From where to throw the dice */
  throwPosition: Triplet,
  /** Callback to call once the dice stops rolling */
  onStopCallback: (n: number) => void,
}

type StopDiceAction = {
  action: "stop-dice",
  /** Transform to optionally set the dice to take once stopping */
  standbyTransform?: Transform,
  /** Whether to hide the dice after stopping it. */
  hideDice?: boolean,
}

type FakeDiceAction = {
  action: "fake-dice"
  /** Transform for the dice to take once it has stopped, to allow "faking" the dice */
  standbyTransform: Transform
}

type InternalStartRolling = {
  action: "internal-start-rolling"
}

export type DiceReducerAction = (
  ThrowDiceAction | StopDiceAction |
  FakeDiceAction | InternalStartRolling
)

export function diceReducer(state: DiceThrowState, action: DiceReducerAction): DiceThrowState {
  switch (action.action) {
    case "throw-dice":
      return {
        ...state, shouldRoll: true,
        isRolling: false,
        display: true,
        throwForce: action.throwForce,
        throwPosition: action.throwPosition,
        onStopCallback: action.onStopCallback
      }

    case "stop-dice":
      return {
        ...state, isRolling: false,
        display: action.hideDice !== true,
        standbyTransform: action.standbyTransform
      }

    case "internal-start-rolling":
      return {
        ...state, isRolling: true,
        shouldRoll: false,
        display: true,
      }

    case "fake-dice":
      return {
        ...state, isRolling: false,
        shouldRoll: false,
        standbyTransform: action.standbyTransform
      }
    default:
      break;
  }

  return state;
}

type gameDiceProps = {
  /** The diceReducer state */
  throwingState: DiceThrowState,
  /** The dice reducer respective dispatcher */
  throwingDispatch: React.Dispatch<DiceReducerAction>,

  additionalBoxProps?: BoxProps,
}

function throwDice(position: Triplet, physicsApi: PublicApi, throwParams: DiceThrowValues) {
  physicsApi.position.set(position[0], position[1], position[2]);
  physicsApi.velocity.set(0, 0, 0);
  physicsApi.applyImpulse(throwParams.velocity, throwParams.offset)
}

function getSideUP(currQuad: number[]) {
  var directions: number[] = [];
  var myactualquad = new Quaternion(currQuad[0], currQuad[1], currQuad[2], currQuad[3]);
  dirVectors.forEach((vec) => {
    var localvec = myactualquad.vmult(vec);
    var similar = cosineSimilarity(LocalDirectionUp, localvec);
    directions.push(similar);
  })

  var argmax = directions.indexOf(Math.max(...directions));
  return argmax + 1;
}

export function GameDice(diceprops: gameDiceProps) {

  const [ref, api] = useBox(() => (
    {
      mass: diceMass, velocity: [0, 0, 0], args: diceSize, material: diceMaterial,
      ...diceprops.additionalBoxProps
    }), useRef<Mesh>(null))

  const currQuad = useRef<number[]>([0, 0, 0, 0])

  const velocityCallback = useCallback((vel: Triplet) => {
    if (tripletLength(vel) < diceStopVelocityThreshold && diceprops.throwingState.isRolling) {
      diceprops.throwingState.onStopCallback(getSideUP(currQuad.current));
      diceprops.throwingDispatch({ action: "stop-dice" })
    }
  }, [diceprops, currQuad])

  /** Track variables at all times, as well as perform callback for checks */
  useEffect(() => {
    const unsubvel = api.velocity.subscribe(velocityCallback);
    const unsubquad = api.quaternion.subscribe((quad) => { currQuad.current = quad })
    return () => { unsubvel(); unsubquad(); }
  }, [api, velocityCallback])

  useEffect(() => {
    if (diceprops.throwingState.shouldRoll) {
      diceprops.throwingDispatch({ action: "internal-start-rolling" }) // first, update state, to ensure it is not run twice
      throwDice(diceprops.throwingState.throwPosition, api, diceprops.throwingState.throwForce)
    }
  }, [api, diceprops])

  // set dice to fake position if on standby

  useEffect(() => {
    if (!diceprops.throwingState.isRolling && diceprops.throwingState.standbyTransform) {
      console.log("i was hacked into a 5")
      api.position.set(...diceprops.throwingState.standbyTransform.position)
      if (diceprops.throwingState.standbyTransform.rotation)
        api.rotation.set(...diceprops.throwingState.standbyTransform.rotation)
    }
  }, [
    api.position, api.rotation,
    diceprops.throwingState.standbyTransform,
    diceprops.throwingState.isRolling])
  // Render
  const materialsfaces = useLoader(TextureLoader, [dice1, dice2, dice3, dice4, dice5, dice6]);
  const cubeMaterials = materialsfaces.map((face) => new MeshStandardMaterial({ map: face }))

  return (
    < mesh ref={ref}
      material={cubeMaterials}
      visible={diceprops.throwingState.display}>
      <boxGeometry args={diceSize} />
    </mesh >
  )
}