import React, { useRef } from "react";
import { useLoader } from '@react-three/fiber'
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { cageMaterial, cageScale, cagePath, jailLocation } from "common/boardConstants";
import { useGameState } from "gameState/gameState";

export function JailCage() {

  const players = useGameState(e => e.players);
  const ref = useRef<THREE.Mesh>(null);
  const loader = useLoader(STLLoader, cagePath);

  var isAnyoneInJail = players.map(e => e.jailCount).some(e => e > -1);

  if (!isAnyoneInJail)
    return null;


  return (
    <mesh ref={ref}
      position={jailLocation}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={cageScale}
      castShadow
      receiveShadow
      geometry={loader}
      material={cageMaterial}
    >
    </mesh>
  );
}

