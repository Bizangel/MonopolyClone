import { BoxProps, useBox, useContactMaterial, PlaneProps, usePlane } from '@react-three/cannon';
import { useLoader } from '@react-three/fiber';
import { useRef } from 'react'
import { Mesh, MeshBasicMaterial } from 'three';
import { TextureLoader } from 'three/src/loaders/TextureLoader'


const logo = require("../../img/saul.jpg");

type gameboardProps = {
  boxprops: BoxProps
  color: string,
}

export function GameBoard(props: gameboardProps) {
  const [ref] = useBox(() => ({ mass: 1, velocity: [0, 0, 0], type: "Kinematic", material: "board", ...props.boxprops }), useRef<Mesh>(null))


  useContactMaterial("dice", "board", {
    restitution: 0.3,
    friction: 1,
  })

  const [colorMap] = useLoader(TextureLoader, [logo]);

  const cubeMaterials: MeshBasicMaterial[] = [];

  const cardboardColor = 0xbb8e51;

  cubeMaterials.push(new MeshBasicMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshBasicMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshBasicMaterial({ map: colorMap }));
  cubeMaterials.push(new MeshBasicMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshBasicMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshBasicMaterial({ color: cardboardColor }));

  return (
    <mesh ref={ref}
      material={cubeMaterials}>
      <boxBufferGeometry args={props.boxprops.args} />
      {/* <meshStandardMaterial map={colorMap} />
       */}


      {/* <meshBasicMaterial map={colorMap} side={OneSide}></meshBasicMaterial> */}
    </mesh>
  )
}


export function InvisiblePlane(props: PlaneProps) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }), useRef<Mesh>(null))
  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[25, 25]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}