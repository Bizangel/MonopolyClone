import { characterMaterial, characterScales, characterToPath, PlayerCharacter } from 'common/characterModelConstants';
import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh } from 'three';

type LobbyCharacterModelPreviewProps = {
  character: PlayerCharacter,
}

export function LobbyCharacterModelPreview(props: LobbyCharacterModelPreviewProps) {
  const ref = useRef<Mesh>(null);

  var charpath = characterToPath.get(props.character);
  if (charpath === undefined)
    throw new Error("No given model path for character: " + props.character)

  const loader = useLoader(GLTFLoader, charpath);
  const character_model = loader.scene.getObjectByName("character_model") as THREE.Mesh;


  useFrame(() => {
    if (ref.current)
      ref.current.rotation.z += 0.005;
  })

  var scale = characterScales.get(props.character)
  if (scale === undefined)
    throw new Error("Player Character Scale is undefined!");

  return (
    <mesh ref={ref}
      scale={scale * 6}
      position={[-0.2, -1.5, 0.2]}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
      geometry={character_model.geometry}
      material={characterMaterial}
    >
    </mesh>
  )

}