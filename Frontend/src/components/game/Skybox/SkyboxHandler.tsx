import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CubeTextureLoader } from "three";
import * as THREE from "three"

type Skybox = "forest" | "desert"

const skyboxToPath = new Map<Skybox, string>(
  [
    ["forest", "forest_skybox"],
    ["desert", "desert_skybox"]
  ]
)

export function SkyboxHandler(props: { bg: Skybox }) {
  const { scene } = useThree();

  useEffect(() => {
    const cubeTexture = new CubeTextureLoader().load(
      ["right", "left", "top", "bottom", "front", "back"].map(e =>
        require(`assets/skyboxes/${skyboxToPath.get(props.bg)}/${e}.png`)
      )
    );

    cubeTexture.encoding = THREE.sRGBEncoding;

    scene.background = cubeTexture;

    return () => {
      cubeTexture.dispose();
    }
  }, [scene, props.bg])

  return null;
}

