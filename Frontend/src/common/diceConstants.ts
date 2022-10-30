import { Vec3 } from "cannon-es"
import { Triplet } from "@react-three/cannon";

const diceSize: Triplet = [0.3, 0.3, 0.3];
const diceMass = 1;
const diceStopVelocityThreshold = 0.05;
const MaxDiceThrowVelocity = 2;
const MaxDiceOffsetPos = 0.1;
// initial dice positions
const dicePositions: [number, number, number][] = [[5, 3, 4.5], [4.5, 3, 5], [5, 3, 5], [5, 3, 3]]

const dice1 = require("assets/dice/dice1.jpeg") as string;
const dice2 = require("assets/dice/dice2.jpeg") as string;
const dice3 = require("assets/dice/dice3.jpeg") as string;
const dice4 = require("assets/dice/dice4.jpeg") as string;
const dice5 = require("assets/dice/dice5.jpeg") as string;
const dice6 = require("assets/dice/dice6.jpeg") as string;

const diceMaterial = "dice";


const LocalDirectionUp = new Vec3(0, 1, 0);

const dirVectors = [
  new Vec3(1, 0, 0),
  new Vec3(-1, 0, 0),
  new Vec3(0, 1, 0),
  new Vec3(0, -1, 0),
  new Vec3(0, 0, 1),
  new Vec3(0, 0, -1),
]

export type Transform = { position: [number, number, number], rotation: [number, number, number] }
export const makeTransform = (position: [number, number, number], rotation: [number, number, number]): Transform => {
  return { position: position, rotation: rotation };
}

export type DiceThrowValues = { velocity: Triplet, offset: Triplet };

export {
  diceMass, diceSize,
  dice1, dice2, dice3, dice4, dice5, dice6,
  diceStopVelocityThreshold, LocalDirectionUp, dirVectors, diceMaterial,
  MaxDiceThrowVelocity, MaxDiceOffsetPos, dicePositions
}
