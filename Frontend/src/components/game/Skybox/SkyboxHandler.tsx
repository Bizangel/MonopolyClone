import { useThree } from "@react-three/fiber";
import { useOnKeyDown } from "hooks/onKeydown";
import { useEffect } from "react";
import { CubeTextureLoader } from "three";
import * as THREE from "three"
import create from 'zustand'

const Skyboxes = ["forest", "desert", "space1"] as const;
type Skybox = typeof Skyboxes[number];

const skyboxToPath = new Map<Skybox, string>(
  [
    ["forest", "forest_skybox"],
    ["desert", "desert_skybox"],
    ["space1", "space1_skybox"]
  ]
)

type SkyboxHook = {
  currentSkybox?: Skybox,
  setSkybox: (newSkybox?: Skybox) => void,
}

const useSkybox = create<SkyboxHook>()(set => ({
  currentSkybox: undefined,

  setSkybox: (newSkybox?: Skybox) => { set({ currentSkybox: newSkybox }) }
}))


export function SkyboxHandler() {

  const { currentSkybox, setSkybox } = useSkybox();
  const { scene } = useThree();

  useOnKeyDown("q", () => {
    setSkybox(undefined);
  })

  useOnKeyDown("w", () => {
    setSkybox("forest");
  })

  useOnKeyDown("e", () => {
    setSkybox("desert");
  })

  useOnKeyDown("r", () => {
    setSkybox("space1");
  })

  useEffect(() => {
    if (currentSkybox === undefined) {
      scene.background = null;
      return
    }


    const cubeTexture = new CubeTextureLoader().load(
      ["right", "left", "top", "bottom", "front", "back"].map(e =>
        require(`assets/skyboxes/${skyboxToPath.get(currentSkybox)}/${e}.png`)
      )
    );

    cubeTexture.encoding = THREE.sRGBEncoding;

    scene.background = cubeTexture;

    return () => {
      scene.background = null;
      cubeTexture.dispose();
    }
  }, [scene, currentSkybox, setSkybox])

  return null;
}

