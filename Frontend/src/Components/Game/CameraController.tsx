import { useEffect } from "react"
import { useThree } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MOUSE } from "three";


export const CameraController = () => {
  const { camera, gl } = useThree();


  useEffect(
    () => {
      camera.position.set(0, 5, 5);
      camera.lookAt(0, 0, 0);
      const controls = new OrbitControls(camera, gl.domElement);

      controls.minDistance = 3;
      controls.maxDistance = 20;
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.screenSpacePanning = false;

      controls.mouseButtons = {
        LEFT: MOUSE.PAN,
        RIGHT: MOUSE.PAN,
        MIDDLE: MOUSE.ROTATE,
      }
      // @ts-ignore
      delete controls.mouseButtons.LEFT



      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};
