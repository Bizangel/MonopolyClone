import { BoxProps, PublicApi, Triplet, useBox } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, MeshStandardMaterial, TextureLoader } from "three";


const dice1 = require("../../img/dice/dice1.jpeg");
const dice2 = require("../../img/dice/dice2.jpeg");
const dice3 = require("../../img/dice/dice3.jpeg");
const dice4 = require("../../img/dice/dice4.jpeg");
const dice5 = require("../../img/dice/dice5.jpeg");
const dice6 = require("../../img/dice/dice6.jpeg");


type gameDiceProps = {
  props: BoxProps,
  color: string,
  resetCaller: boolean,
  throwForce: Triplet,
  throwOffset: Triplet
  display: boolean,
  onStopCallback: () => void,
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


export function GameDice(diceprops: gameDiceProps) {

  const [ref, api] = useBox(() => ({ mass: 1, velocity: [0, 0, 0], ...diceprops.props }), useRef<Mesh>(null))

  const [stopCalled, setOnStopCalled] = useState(false);

  useEffect(() => {
    if (diceprops.props.position !== undefined)
      throwDice(diceprops.props.position, api, diceprops.throwForce, diceprops.throwOffset)
    setOnStopCalled(false);
  }, [diceprops.resetCaller, api, diceprops.props.position, diceprops.throwForce, diceprops.throwOffset])

  useEffect(() => {
    if (!stopCalled && diceprops.display) {
      const unsubscribe = api.velocity.subscribe((velocity) => {
        if (tripletLength(velocity) < 0.1) { setOnStopCalled(val => true); diceprops.onStopCallback(); }
      })
      return unsubscribe
    }
  })

  // whenever stop called changes


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