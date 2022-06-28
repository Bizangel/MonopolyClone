import React, { useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh, MeshStandardMaterial, TextureLoader, Vector3 } from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { useBox } from "@react-three/cannon";
import { BaseCharacterSpeed, SpeedBoostDistance, getMidPoint, tileToWorldLocation, SpeedBostScale, DistanceArriveThreshold } from "../../../common/boardhelpers";

type GLTFResult = GLTF & {
  nodes: {
    char1_cart: THREE.Mesh
  }
}

const char1model_path = require("../../../img/models3d/char1_car.glb") as string;

// Material for characters
const alumininum_ao = require("../../../img/models3d/texture/ao.jpg") as string;
const alumininum_colormap = require("../../../img/models3d/texture/colormap.jpg") as string;
const alumininum_roughness = require("../../../img/models3d/texture/roughness.jpg") as string;


type CharacterModelProps = {
  displayScale: number,
  currentTile: number,
}

export function CharacterModel(props: CharacterModelProps) {

  const [tileTarget, setTileTarget] = useState<Vector3 | null>(null)
  const [currTileInternal, setCurrentTileInternal] = useState(0);
  const [fakeTarget, setFakeTarget] = useState(false);

  const currPos = useRef([3, 0.12, 3]);

  const [ref, cannonapi] = useBox(() =>
  ({
    mass: 1, velocity: [0, 0, 0], type: "Kinematic", material: "character",
    position: [3, 0.12, 3], rotation: [Math.PI / 2, 0, 0], args: [bbox.x, bbox.y, bbox.z]
  }), useRef<Mesh>(null))


  /* When tile changes, automatically move to said tile*/
  useEffect(() => {
    // move to said tile
    if (currPos.current !== null && currTileInternal !== props.currentTile) {
      if (Math.floor(currTileInternal / 10) !== Math.floor(props.currentTile / 10)) { // different row
        // go first to next corner 
        var nextCorner = (Math.floor(currTileInternal / 10) + 1) * 10 % 40;
        var temptarget = getMidPoint(tileToWorldLocation(nextCorner));
        setTileTarget(temptarget);
        setFakeTarget(true);
        return;
      }

      var target = getMidPoint(tileToWorldLocation(props.currentTile));
      setTileTarget(target);
      setFakeTarget(false);
    }

  }, [props.currentTile, currTileInternal, setFakeTarget])

  // Keep track of position at all times
  useEffect(() => {
    const unsub = cannonapi.position.subscribe((pos) => {
      currPos.current = pos
    })
    return unsub;
  }, [cannonapi])

  useFrame((state, delta) => {
    if (tileTarget !== null) {
      var target = tileTarget;

      var currLoc = new Vector3(...currPos.current)

      // check if close enough
      var distance = currLoc.distanceTo(target);
      if (distance < DistanceArriveThreshold) {
        setTileTarget(null);

        if (fakeTarget) {
          var nextCorner = (Math.floor(currTileInternal / 10) + 1) * 10 % 40;
          setCurrentTileInternal(nextCorner);
          return;
        }
        setCurrentTileInternal(props.currentTile);
        return;
      }

      var dirVector = new Vector3();
      dirVector.subVectors(target, currLoc);
      dirVector.normalize();
      var angles = Math.atan2(dirVector.z, dirVector.x) + Math.PI;
      if (distance < SpeedBoostDistance)
        dirVector.multiplyScalar(delta * BaseCharacterSpeed);
      else
        dirVector.multiplyScalar(delta * BaseCharacterSpeed * (SpeedBostScale));


      currLoc.add(dirVector);

      // set rotation while moving.
      cannonapi.position.set(currLoc.x, currLoc.y, currLoc.z)
      cannonapi.rotation.set(Math.PI / 2, 0, angles)



    }
  })




  /* Render Stuff */
  const { nodes } = useGLTF(char1model_path) as unknown as GLTFResult;
  if (nodes.char1_cart.geometry.boundingBox === null)
    nodes.char1_cart.geometry.computeBoundingBox();
  var bbox = new Vector3();
  if (nodes.char1_cart.geometry.boundingBox !== null)
    bbox = nodes.char1_cart.geometry.boundingBox.max.sub(nodes.char1_cart.geometry.boundingBox.min).multiplyScalar(props.displayScale);
  const [aoMap, colorMap, roughnessMap] = useLoader(
    TextureLoader, [alumininum_ao, alumininum_colormap, alumininum_roughness]);
  var characterMaterial = new MeshStandardMaterial({ aoMap: aoMap, map: colorMap, roughnessMap: roughnessMap });

  return (
    <mesh ref={ref}
      scale={props.displayScale}
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
