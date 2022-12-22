import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CubeTextureLoader } from "three";
import * as THREE from "three"
import create from 'zustand'

const Skyboxes = ["space", "sky", "bluespace", "lightbluespace", "desert"] as const;
type Skybox = typeof Skyboxes[number];

const skyBoxExtension = new Map<Skybox, string>(
  [
    ["sky", "jpg"],
  ]
)

type SkyboxHook = {
  currentSkybox?: Skybox,
  setSkybox: (newSkybox?: Skybox) => void,
  cycleSkybox: () => void,
}

export const useSkybox = create<SkyboxHook>()((set, get) => ({
  currentSkybox: "space",

  setSkybox: (newSkybox?: Skybox) => { set({ currentSkybox: newSkybox }) },
  cycleSkybox: () => {
    if (get().currentSkybox === undefined) {
      set({ currentSkybox: Skyboxes[0] });
      return;
    }

    var index = Skyboxes.findIndex((e) => e === get().currentSkybox);
    if (index === Skyboxes.length - 1)
      set({ currentSkybox: undefined });
    else
      set({ currentSkybox: Skyboxes[index + 1] });
  }
}))


export function SkyboxHandler() {

  const { currentSkybox } = useSkybox();
  const { scene } = useThree();

  useEffect(() => {
    if (currentSkybox === undefined) {
      scene.background = null;
      scene.background = new THREE.Color(0x5e85c4);
      return
    }

    var ext = skyBoxExtension.get(currentSkybox);
    const cubeTexture = new CubeTextureLoader().load(
      ["right", "left", "top", "bottom", "front", "back"].map(e =>
        require(`assets/skyboxes/${currentSkybox}_skybox/${e}.${ext ? ext : "png"}`)
      )
    );


    cubeTexture.encoding = THREE.sRGBEncoding;

    scene.background = cubeTexture;

    return () => {
      scene.background = null;
      cubeTexture.dispose();
    }
  }, [scene, currentSkybox])

  return null;
}

