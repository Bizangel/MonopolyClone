import { MeshStandardMaterial } from "three";

export enum PlayerCharacter {
  Car,
  Iron,
  Hat,
  Ship,
  Wheelcart,
  Thimble,
}

const char1model_path = require("assets/models3d/char1_car.glb") as string;
const char2model_path = require("assets/models3d/char2_iron.glb") as string;
const char3model_path = require("assets/models3d/char3_hat.glb") as string;
const char4model_path = require("assets/models3d/char4_ship.glb") as string;
const char5model_path = require("assets/models3d/char5_wheelcart.glb") as string;
const char6model_path = require("assets/models3d/char6_thimble.glb") as string;




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

// Material for characters
export const characterMaterial = new MeshStandardMaterial({ color: 0x959595, metalness: 0.3, roughness: 0.2 })
// export const goldenCharacterMaterial = new MeshStandardMaterial({ color: 0xedda5f, metalness: 0.3, roughness: 0.37 })
// export const blueCharacterMaterial = new MeshStandardMaterial({ color: 0x7162f5, metalness: 0.3, roughness: 0.3 })