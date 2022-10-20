import React, { useEffect, useRef, useState } from "react";
import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { BaseCharacterSpeed, SpeedBoostDistance, getMidPoint, tileToWorldLocation, SpeedBostScale, DistanceArriveThreshold, boardSize, getNextTileRotation } from "../../../common/boardhelpers";
import { characterToPath, PlayerCharacter, characterScales, characterRotationOffset } from "./PlayerCharacterCommons"
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


// Material for characters
var characterMaterial = new MeshStandardMaterial({ color: 0x959595, metalness: 0.3, roughness: 0.2 })

type CharacterModelProps = {
  currentTile: number,
  baseRotation: [number, number, number],
  yoffset: number,
  character: PlayerCharacter,
  onStopLocation?: Vector3,
}

export function CharacterModel(props: CharacterModelProps) {

  const [tileTarget, setTileTarget] = useState<Vector3 | null>(null)
  const [currTileInternal, setCurrentTileInternal] = useState(0);
  const [fakeTarget, setFakeTarget] = useState(false);

  const currPos = useRef([boardSize / 2, props.yoffset, boardSize / 2]);

  const [ref, cannonapi] = useBox(() =>
  ({
    mass: 1, velocity: [0, 0, 0], type: "Kinematic", material: "character",
    position: [boardSize / 2, props.yoffset, boardSize / 2], rotation: props.baseRotation, args: [bbox.x, bbox.y, bbox.z]
  }), useRef<Mesh>(null))

  /* When tile changes, automatically move to said tile*/
  useEffect(() => {
    // move to said tile
    if (currPos.current !== null && currTileInternal !== props.currentTile) {
      if (Math.floor(currTileInternal / 10) !== Math.floor(props.currentTile / 10) || props.currentTile < currTileInternal) { // different row, or before
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
      currPos.current = pos;
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
          if (props.currentTile === nextCorner && props.onStopLocation !== undefined) { // if actually arrived, (going to corner)
            cannonapi.position.set(props.onStopLocation.x, props.onStopLocation.y, props.onStopLocation.z);
            cannonapi.rotation.set(props.baseRotation[0], props.baseRotation[1], props.baseRotation[2] + getNextTileRotation(props.currentTile))
          }
          return;
        }

        var angleoffset2 = characterRotationOffset.get(props.character)
        if (angleoffset2 === undefined)
          throw new Error("no defined offset for given character: " + props.character)

        if (props.onStopLocation !== undefined) {
          cannonapi.position.set(props.onStopLocation.x, props.onStopLocation.y, props.onStopLocation.z);
          cannonapi.rotation.set(props.baseRotation[0], props.baseRotation[1], props.baseRotation[2] + angleoffset2 + getNextTileRotation(props.currentTile))
        }

        setCurrentTileInternal(props.currentTile);
        return;
      }

      var dirVector = new Vector3();
      dirVector.subVectors(target, currLoc);
      dirVector.normalize();

      var angleoffset = characterRotationOffset.get(props.character)
      if (angleoffset === undefined)
        throw new Error("no defined offset for given character: " + props.character)

      var angles = Math.atan2(dirVector.z, dirVector.x) + angleoffset;
      if (distance < SpeedBoostDistance)
        dirVector.multiplyScalar(delta * BaseCharacterSpeed);
      else
        dirVector.multiplyScalar(delta * BaseCharacterSpeed * (SpeedBostScale));


      currLoc.add(dirVector);

      // set rotation while moving.
      cannonapi.position.set(currLoc.x, currLoc.y, currLoc.z)
      cannonapi.rotation.set(props.baseRotation[0], props.baseRotation[1], props.baseRotation[2] + angles)



    }
  })




  /* Render Stuff */

  var dispScale = characterScales.get(props.character);
  if (dispScale === undefined)
    throw new Error("No given character scale for: " + props.character)

  var charpath = characterToPath.get(props.character);
  if (charpath === undefined)
    throw new Error("No given model path for character: " + props.character)

  const loader = useLoader(GLTFLoader, charpath);
  const character_model = loader.scene.getObjectByName("character_model") as THREE.Mesh

  var bbox = new Vector3();
  if (character_model.geometry.boundingBox !== null)
    bbox = character_model.geometry.boundingBox.max.sub(character_model.geometry.boundingBox.min).multiplyScalar(dispScale);

  return (
    <mesh ref={ref}
      scale={dispScale}
      castShadow
      receiveShadow
      geometry={character_model.geometry}
      material={characterMaterial}
    >
    </mesh>
  );
}