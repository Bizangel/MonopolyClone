import { BoxProps, useBox, useContactMaterial, PlaneProps, usePlane } from '@react-three/cannon';
import { useLoader } from '@react-three/fiber';
import { useRef } from 'react'
import { Mesh, MeshStandardMaterial } from 'three';
import { TextureLoader } from 'three/src/loaders/TextureLoader'


const boardimg = require("../../img/board.jpg");

type gameboardProps = {
  boxprops: BoxProps
  color: string,
  onClickCallback?: () => void,
}

export function GameBoard(props: gameboardProps) {
  const [ref] = useBox(() => ({ mass: 1, velocity: [0, 0, 0], type: "Kinematic", material: "board", ...props.boxprops }), useRef<Mesh>(null))

  useContactMaterial("dice", "board", {
    restitution: 0.3,
    friction: 1,
  })

  const [colorMap] = useLoader(TextureLoader, [boardimg]);

  // Basic material isn't affected by lightning, Standard is.
  const cubeMaterials: MeshStandardMaterial[] = [];

  const cardboardColor = 0xbb8e51;

  cubeMaterials.push(new MeshStandardMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshStandardMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshStandardMaterial({ map: colorMap }));
  cubeMaterials.push(new MeshStandardMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshStandardMaterial({ color: cardboardColor }));
  cubeMaterials.push(new MeshStandardMaterial({ color: cardboardColor }));

  return (
    <mesh ref={ref}
      material={cubeMaterials}
      onClick={props.onClickCallback}
    >
      <boxBufferGeometry args={props.boxprops.args} />
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