import React, { useRef } from "react";
import { useLoader } from '@react-three/fiber'
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { hotelMaterial, houseMaterial, housePath, houseScale } from "common/boardConstants";

type Vector3 = [number, number, number];

export function GameTileHouse(props: { position: THREE.Vector3, rotation: Vector3, hotel?: boolean }) {

  const ref = useRef<THREE.Mesh>(null);
  const loader = useLoader(STLLoader, housePath);

  // ref.current.
  return (
    <mesh ref={ref}
      position={props.position}
      // rotation={[0, Math.PI / 2, 0]}
      rotation={props.rotation}
      scale={houseScale}
      castShadow
      receiveShadow
      geometry={loader}
      material={props.hotel ? hotelMaterial : houseMaterial}
    >
    </mesh>
  );
}

export function Hotel(props: { position: THREE.Vector3, rotation: Vector3 }) {

  const ref = useRef<THREE.Mesh>(null);
  const loader = useLoader(STLLoader, housePath);

  // ref.current.
  return (
    <mesh ref={ref}
      position={props.position}
      rotation={props.rotation}
      scale={houseScale}
      castShadow
      receiveShadow
      geometry={loader}
      material={hotelMaterial}
    >
    </mesh>
  );
}

