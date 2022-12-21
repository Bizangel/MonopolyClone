import { useEffect, useRef } from "react"
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export interface copyref {
  cameraLookAt: (x: number, y: number, z: number) => void,
  cameraSetPos: (x: number, y: number, z: number) => void,
}

type cameraProps = {
  initialPos: [number, number, number]
  initialLookatLocation: [number, number, number]
}

export function StaticRotatingCamera(props: cameraProps) {
  const { camera, gl } = useThree();

  const time = useRef(0);
  const cameraCircleDistance = 9;
  const cameraHeight = 6;

  useFrame((state, delta) => {
    time.current += delta * 0.2;

    camera.position.set(Math.cos(time.current) * cameraCircleDistance, cameraHeight, Math.sin(time.current) * cameraCircleDistance);
    camera.lookAt(0, 0, 0);

    time.current %= 2 * Math.PI;
  });

  useEffect(
    () => {
      if (props.initialPos)
        camera.position.set(...props.initialPos);

      if (props.initialLookatLocation)
        camera.lookAt(...props.initialLookatLocation);

      const controls = new OrbitControls(camera, gl.domElement);

      controls.enableRotate = false;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.screenSpacePanning = false;

      return () => {
        controls.dispose();
      };
    },
    [camera, gl, props.initialPos, props.initialLookatLocation]
  );

  return null;
};