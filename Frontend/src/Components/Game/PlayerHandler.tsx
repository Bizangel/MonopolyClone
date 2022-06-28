import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh, MeshStandardMaterial, TextureLoader, Vector3 } from "three";
import { useLoader } from "@react-three/fiber";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { useBox } from "@react-three/cannon";

type GLTFResult = GLTF & {
  nodes: {
    char1_cart: THREE.Mesh
  }
}

const char1model_path = require("../../img/models3d/char1_car.glb") as string;

// Material for characters
const alumininum_ao = require("../../img/models3d/texture/ao.jpg") as string;
const alumininum_colormap = require("../../img/models3d/texture/colormap.jpg") as string;
// const alumininum_heightmap = require("../../img/models3d/texture/heightmap.png") as string;
// const alumininum_normal = require("../../img/models3d/texture/normal.png") as string;
const alumininum_roughness = require("../../img/models3d/texture/roughness.jpg") as string;


const displayScale = 0.002;
export function PlayerHandler({ ...props }) {
  const { nodes } = useGLTF(char1model_path) as unknown as GLTFResult;

  if (nodes.char1_cart.geometry.boundingBox === null)
    nodes.char1_cart.geometry.computeBoundingBox();

  var bbox: undefined | Vector3 = undefined;
  if (nodes.char1_cart.geometry.boundingBox !== null)
    bbox = nodes.char1_cart.geometry.boundingBox.max.sub(nodes.char1_cart.geometry.boundingBox.min).multiplyScalar(displayScale);

  const [ref] = useBox(() =>
  ({
    mass: 1, velocity: [0, 0, 0], type: "Kinematic", material: "board",
    position: [3, 0.12, 3], rotation: [Math.PI / 2, 0, 0], args: [bbox?.x, bbox?.y, bbox?.z], ...props.boxprops
  }), useRef<Mesh>(null))

  const [aoMap, colorMap, roughnessMap] = useLoader(
    TextureLoader, [alumininum_ao, alumininum_colormap, alumininum_roughness]);
  var characterMaterial = new MeshStandardMaterial({ aoMap: aoMap, map: colorMap, roughnessMap: roughnessMap });

  return (
    <mesh ref={ref}
      scale={displayScale}
      castShadow
      receiveShadow
      geometry={nodes.char1_cart.geometry}
      material={characterMaterial}
    >
      <meshStandardMaterial attach="material"
        map={colorMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
      />
    </mesh>
  );
}

useGLTF.preload(char1model_path);
