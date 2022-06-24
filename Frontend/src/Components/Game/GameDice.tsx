import { BoxProps, useBox, useContactMaterial } from "@react-three/cannon";
import { useCallback, useEffect, useRef } from "react";
import { Mesh } from "three";



type gameDiceProps = {
  props: BoxProps,
  color: string,
}


export function GameDice(diceprops: gameDiceProps) {

  const maxvelocity = 2;
  const offsetForce = 0.1;


  const [ref, api] = useBox(() => ({ mass: 1, velocity: [0, 0, 0], ...diceprops.props }), useRef<Mesh>(null))


  const throwDice = useCallback(() => {
    if (diceprops.props.position !== undefined) {
      api.position.set(diceprops.props.position[0], diceprops.props.position[1], diceprops.props.position[2]);
      api.velocity.set(0, 0, 0);

      var velx = -(Math.random()) * maxvelocity - 1.5;
      var vely = Math.random();
      var velz = -(Math.random()) * maxvelocity - 1.5;
      api.applyImpulse([velx, vely, velz], [Math.random() * offsetForce, Math.random() * offsetForce, Math.random() * offsetForce])
    }
  }, [api, diceprops]);


  // const mat3_ground = new CANNON.ContactMaterial(groundMaterial, mat3, { friction: 0.0, restitution: 0.9 })

  useContactMaterial("dice", "board", {
    restitution: 0.3,
    friction: 1,
  })

  useEffect(
    () => {
      throwDice();
    }
    , [throwDice]);




  return (
    <mesh ref={ref}>
      <boxBufferGeometry args={diceprops.props.args} />
      <meshStandardMaterial color={diceprops.color} />
    </mesh>
  )
}