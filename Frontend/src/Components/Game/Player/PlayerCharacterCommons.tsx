import { useGLTF } from "@react-three/drei";


export enum PlayerCharacter {
  Car,
  Iron,
  Hat,
  Ship,
  Wheelcart,
  Thimble,
}

const char1model_path = require("../../../img/models3d/char1_car.glb") as string;
const char2model_path = require("../../../img/models3d/char2_iron.glb") as string;
const char3model_path = require("../../../img/models3d/char3_hat.glb") as string;
const char4model_path = require("../../../img/models3d/char4_ship.glb") as string;
const char5model_path = require("../../../img/models3d/char5_wheelcart.glb") as string;
const char6model_path = require("../../../img/models3d/char6_thimble.glb") as string;


export const characterToPath = new Map<number, string>([
  [PlayerCharacter.Car, char1model_path],
  [PlayerCharacter.Iron, char2model_path],
  [PlayerCharacter.Hat, char3model_path],
  [PlayerCharacter.Ship, char4model_path],
  [PlayerCharacter.Wheelcart, char5model_path],
  [PlayerCharacter.Thimble, char6model_path],
])

export const characterScales = new Map<number, number>([
  [PlayerCharacter.Car, 0.002],
  [PlayerCharacter.Iron, 0.004],
  [PlayerCharacter.Hat, 0.003],
  [PlayerCharacter.Ship, 0.003],
  [PlayerCharacter.Wheelcart, 0.003],
  [PlayerCharacter.Thimble, 0.0055],
])

export const characterRotationOffset = new Map<number, number>([
  [PlayerCharacter.Car, Math.PI],
  [PlayerCharacter.Iron, Math.PI / 2],
  [PlayerCharacter.Hat, Math.PI / 4],
  [PlayerCharacter.Ship, Math.PI / 2],
  [PlayerCharacter.Wheelcart, Math.PI],
  [PlayerCharacter.Thimble, 0],
])


useGLTF.preload(char1model_path);
useGLTF.preload(char2model_path);
useGLTF.preload(char3model_path);
useGLTF.preload(char4model_path);
useGLTF.preload(char5model_path);
useGLTF.preload(char6model_path);
