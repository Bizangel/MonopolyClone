import { characterMaterial, characterToPath, PlayerCharacter } from 'common/characterModelConstants';
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

  return (
    <mesh ref={ref}
      scale={0.01}
      position={[0, -0.1, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
      geometry={character_model.geometry}
      material={characterMaterial}
    >
    </mesh>
  )

}