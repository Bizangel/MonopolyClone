import { useEffect } from "react"
import { useThree } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const CameraController = () => {
  const { camera, gl } = useThree();


  useEffect(
    () => {
      camera.position.set(-5, 5, 0);
      camera.lookAt(0, 0, 0);
      const controls = new OrbitControls(camera, gl.domElement);

      controls.minDistance = 3;
      controls.maxDistance = 20;
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.screenSpacePanning = false;
      controls.keys = {
        LEFT: 'ArrowLeft', //left arrow
        UP: 'ArrowUp', // up arrow
        RIGHT: 'ArrowRight', // right arrow
        BOTTOM: 'ArrowDown' // down arrow
      }

      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};
