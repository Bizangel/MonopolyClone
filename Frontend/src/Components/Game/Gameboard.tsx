import { useBox, useContactMaterial, PlaneProps, usePlane } from '@react-three/cannon';
import { ThreeEvent, useLoader } from '@react-three/fiber';
import { useRef } from 'react'
import { Mesh, MeshStandardMaterial } from 'three';
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { imagepixels_to_tileindex, boardSize, tileToWorldLocation, boardYLocation } from '../../common/boardhelpers';

const boardimg = require("../../img/board_fireteam.jpg");

type gameboardProps = {
  color: string,
  onTileClicked?: (tileIndex: number) => void,
}

export function GameBoard(props: gameboardProps) {
  const [ref] = useBox(() => ({ mass: 1, velocity: [0, 0, 0], type: "Kinematic", material: "board" }), useRef<Mesh>(null))

  useContactMaterial("dice", "board", {
    restitution: 0.3,
    friction: 1,
  })

  const [colorMap] = useLoader(TextureLoader, [boardimg]);

  const onBoardClick = (event: ThreeEvent<MouseEvent>) => {

    var x = (event.point.x + boardSize / 2) / boardSize * 1600; // board in pixels
    var y = (event.point.z + boardSize / 2) / boardSize * 1600;

    var tileIndex = imagepixels_to_tileindex(x, y);

    if (tileIndex !== undefined)
      tileToWorldLocation(tileIndex)

    if (props.onTileClicked !== undefined && tileIndex !== undefined)
      props.onTileClicked(tileIndex);
  }



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
      onClick={onBoardClick}
    >
      <boxBufferGeometry args={[boardSize, boardYLocation, boardSize]} />
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