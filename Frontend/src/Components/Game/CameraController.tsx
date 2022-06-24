import { useEffect } from "react"
import { useThree } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const CameraController = () => {
  const { camera, gl } = useThree();


  useEffect(
    () => {
      camera.position.set(-10, 5, 0);
      camera.lookAt(0, 0, 0);
      const controls = new OrbitControls(camera, gl.domElement);

      controls.minDistance = 3;
      controls.maxDistance = 20;
      controls.enableRotate = true;
      controls.enablePan = false;
      controls.enableZoom = true;


      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};
