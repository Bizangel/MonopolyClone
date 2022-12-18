import React, { useRef } from "react";
import { useLoader } from '@react-three/fiber'
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { houseMaterial, housePath, houseScale } from "common/boardConstants";

type Vector3 = [number, number, number];

export function GameTileHouse(props: { position: Vector3 }) {

  const ref = useRef<THREE.Mesh>(null);
  const loader = useLoader(STLLoader, housePath);

  // ref.current.
  return (
    <mesh ref={ref}
      position={props.position}
      rotation={[0, Math.PI / 2, 0]}
      scale={houseScale}
      castShadow
      receiveShadow
      geometry={loader}
      material={houseMaterial}
    >
    </mesh>
  );
}
