import { forwardRef, Ref, useEffect, useImperativeHandle, useState } from "react"
import { useThree } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MOUSE } from "three";

export interface CameraRefObject {
  cameraLookAt: (x: number, y: number, z: number) => void,
  cameraSetPos: (x: number, y: number, z: number) => void,
}

type cameraProps = {
  initialPos: [number, number, number]
  initialLookatLocation: [number, number, number]
}

type cameraControls = {
  pos?: [number, number, number],
  lookAt?: [number, number, number],
}

export const CameraController = forwardRef((props: cameraProps, ref: Ref<CameraRefObject>) => {
  const { camera, gl } = useThree();

  const [controlsRequest, setControlRequest] = useState<cameraControls>({ pos: props.initialPos, lookAt: props.initialLookatLocation });

  useImperativeHandle(ref, () => ({
    cameraLookAt(x: number, y: number, z: number) {
      setControlRequest({ lookAt: [x, y, z] })
    },

    cameraSetPos(x: number, y: number, z: number) {
      setControlRequest({ pos: [x, y, z] })
    }
  }));


  useEffect(
    () => {
      if (controlsRequest.pos !== undefined)
        camera.position.set(controlsRequest.pos[0], controlsRequest.pos[1], controlsRequest.pos[2]);

      if (controlsRequest.lookAt !== undefined)
        camera.lookAt(controlsRequest.lookAt[0], controlsRequest.lookAt[1], controlsRequest.lookAt[2]);
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
    [camera, gl, controlsRequest]
  );

  return null;
});