import { BoxProps, PublicApi, Triplet, useBox } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mesh, MeshStandardMaterial, TextureLoader } from "three";
import { Vec3, Quaternion } from "cannon-es"


const dice1 = require("../../img/dice/dice1.jpeg");
const dice2 = require("../../img/dice/dice2.jpeg");
const dice3 = require("../../img/dice/dice3.jpeg");
const dice4 = require("../../img/dice/dice4.jpeg");
const dice5 = require("../../img/dice/dice5.jpeg");
const dice6 = require("../../img/dice/dice6.jpeg");

const diceStopVelocityThreshold = 0.05;

const LocalDirectionUp = new Vec3(0, 1, 0);
const dirVectors = [
  new Vec3(1, 0, 0),
  new Vec3(-1, 0, 0),
  new Vec3(0, 1, 0),
  new Vec3(0, -1, 0),
  new Vec3(0, 0, 1),
  new Vec3(0, 0, -1),
]

function cosineSimilarity(vec1: Vec3, vec2: Vec3) {
  return vec1.dot(vec2) / (vec1.length() * vec2.length());
}

type gameDiceProps = {
  props: BoxProps,
  color: string,
  performThrow: boolean,
  setPerformThrow: React.Dispatch<React.SetStateAction<boolean>>,
  throwParams: throwValues,
  display: boolean,
  onStopCallback: (sideUp: number) => void, // landed side up
  onStopTransform?: { position: [number, number, number], rotation?: [number, number, number] }
}


function tripletLength(triplet: Triplet, squared = false) {
  var sq = triplet[0] * triplet[0] + triplet[1] * triplet[1] + triplet[2] * triplet[2]
  if (squared)
    return sq
  return Math.sqrt(sq);
}

function throwDice(position: Triplet, physicsApi: PublicApi, velocity: Triplet, offsetApply: Triplet) {
  physicsApi.position.set(position[0], position[1], position[2]);
  physicsApi.velocity.set(0, 0, 0);
  physicsApi.applyImpulse(velocity, offsetApply)
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


export type throwValues = { velocity: Triplet, offset: Triplet };

export function GameDice(diceprops: gameDiceProps) {

  const [ref, api] = useBox(() => ({ mass: 1, velocity: [0, 0, 0], ...diceprops.props }), useRef<Mesh>(null))
  const [currQuad, setCurrQuad] = useState([0, 0, 0, 0]);
  const [stopCalled, setOnStopCalled] = useState(false);

  // whenever it receives the performThrow order from the parent, throw dices
  useEffect(() => {
    if (diceprops.props.position !== undefined && diceprops.display && diceprops.performThrow) {
      throwDice(diceprops.props.position, api, diceprops.throwParams.velocity, diceprops.throwParams.offset)
      diceprops.setPerformThrow(false);
      setOnStopCalled(false);
    }
  }, [diceprops, api])



  // Perform proper callbacks once velocity is set close to 0
  const velocityCallback = useCallback((vel: Triplet) => {
    if (diceprops.display && tripletLength(vel) < diceStopVelocityThreshold && !stopCalled) {
      diceprops.onStopCallback(getSideUP(currQuad));
      setOnStopCalled(true);
    }
  }, [diceprops, stopCalled, currQuad])

  // subscribe to keep track of variables like speed and so
  useEffect(() => { // welcome to react, where you need to do this thing, and resubscribe every 0.033 ms. I'm for sure using a state managing library next time.
    const unsubvel = api.velocity.subscribe(velocityCallback);
    const unsubquad = api.quaternion.subscribe((quad) => { setCurrQuad(quad) })
    return () => { unsubvel(); unsubquad(); }
  }, [api.velocity, api.quaternion, velocityCallback])


  // whenever dice is stopped, set props stop location (should it exist!)
  useEffect(() => {
    if (stopCalled && diceprops.onStopTransform !== undefined && !diceprops.performThrow) {
      api.velocity.set(0, 0, 0);
      api.position.set(...diceprops.onStopTransform.position);
      if (diceprops.onStopTransform.rotation !== undefined)
        api.rotation.set(...diceprops.onStopTransform.rotation);
    }
  }, [stopCalled, api, diceprops.onStopTransform, diceprops.performThrow])

  // Render
  const materialsfaces = useLoader(TextureLoader, [dice1, dice2, dice3, dice4, dice5, dice6]);
  const cubeMaterials = materialsfaces.map((face) => new MeshStandardMaterial({ map: face }))
  return (
    < mesh ref={ref}
      material={cubeMaterials}
      visible={diceprops.display}>
      <boxBufferGeometry args={diceprops.props.args} />
    </mesh >
  )
}