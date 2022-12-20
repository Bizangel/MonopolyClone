import React, { useEffect, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { getMidPoint, tileToWorldLocation, getNextTileRotation } from "utils/boardHelpers";
import * as bc from 'common/boardConstants'
import { characterToPath, PlayerCharacter, characterScales, characterRotationOffset, characterMaterial } from "common/characterModelConstants"
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import create from "zustand"
import produce from "immer"

// Helper type and store to globally notify if character is actually moving or not
type CharacterHasStopped = {
  characterToStopped: Map<PlayerCharacter, boolean>,

  setStopped: (stopped: boolean, character: PlayerCharacter) => void,
};

export const useCharacterStoppedStore = create<CharacterHasStopped>()((set) => ({
  characterToStopped: new Map<PlayerCharacter, boolean>(),
  setStopped: (stopped: boolean, character: PlayerCharacter) => {
    set((e) => produce(e, (draft) => {
      draft.characterToStopped.set(character, stopped);
    }))
  }
}))

type CharacterModelProps = {
  currentTile: number,
  baseRotation: [number, number, number],
  yoffset: number,
  character: PlayerCharacter,
  onStopLocation?: Vector3,
  isJailed: boolean,
}

export function CharacterModel(props: CharacterModelProps) {
  const [tileTarget, setTileTarget] = useState<Vector3 | null>(null)
  const [currTileInternal, setCurrentTileInternal] = useState(0);
  const [fakeTarget, setFakeTarget] = useState(false);

  const currPos = useRef([bc.boardSize / 2, props.yoffset, bc.boardSize / 2]);

  const [ref, cannonapi] = useBox(() =>
  ({
    mass: 1, velocity: [0, 0, 0], type: "Kinematic", material: "character",
    position: [bc.boardSize / 2, props.yoffset, bc.boardSize / 2], rotation: props.baseRotation, args: [bbox.x, bbox.y, bbox.z]
  }), useRef<Mesh>(null))

  const setStopped = useCharacterStoppedStore(e => e.setStopped);

  /* When tile changes, automatically move to said tile*/
  useEffect(() => {
    // move to said tile
    if (currPos.current !== null && currTileInternal !== props.currentTile && !props.isJailed) {
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

  }, [props.currentTile, currTileInternal, setFakeTarget, props.isJailed])


  useEffect(() => {
    if (props.isJailed) {
      setCurrentTileInternal(10); // internal tile will be 10 as that's where it is supposed to starts
    }
  }, [props.isJailed]);
  // update always to see if arrived location or not
  useEffect(() => {
    // if jailed, just count as stopped anyways cuz not moving
    setStopped(props.currentTile === currTileInternal || props.isJailed, props.character);
  },
    [setStopped, props.currentTile, currTileInternal, props.character, props.isJailed])

  // Keep track of position at all times
  useEffect(() => {
    const unsub = cannonapi.position.subscribe((pos) => {
      currPos.current = pos;
    })
    return unsub;
  }, [cannonapi])

  useFrame((state, delta) => {
    if (tileTarget !== null && !props.isJailed) {
      var target = tileTarget;

      var currLoc = new Vector3(...currPos.current)

      // check if close enough
      var distance = currLoc.distanceTo(target);

      // if far enough, just tp to target
      if (distance > bc.DistanceToTeleportThreshold) {
        cannonapi.position.set(target.x, target.y, target.z) // teleport there, and return
        return;
      };

      if (distance < bc.DistanceArriveThreshold) {
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
      if (distance < bc.SpeedBoostDistance)
        dirVector.multiplyScalar(delta * bc.BaseCharacterSpeed);
      else
        dirVector.multiplyScalar(delta * bc.BaseCharacterSpeed * (bc.SpeedBostScale));


      currLoc.add(dirVector);

      // set rotation while moving.
      cannonapi.position.set(currLoc.x, currLoc.y, currLoc.z)
      cannonapi.rotation.set(props.baseRotation[0], props.baseRotation[1], props.baseRotation[2] + angles)



    }

    if (props.isJailed) {
      // go to jail square
      var currLoc2 = new Vector3(...currPos.current);

      var dir = bc.jailLocation.clone().sub(currLoc2).normalize();
      var distanceToJail = currLoc2.distanceTo(bc.jailLocation);

      if (distanceToJail < bc.DistanceArriveThreshold)
        return;

      var newLoc = currLoc2.clone().add(dir.clone().multiplyScalar(delta * bc.BaseCharacterSpeed * 2));
      cannonapi.position.set(newLoc.x, newLoc.y, newLoc.z);

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