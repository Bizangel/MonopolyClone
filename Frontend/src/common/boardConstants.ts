import { MeshStandardMaterial, Vector3 } from "three";

/* Board Global Consts */
export const boardSize = 10; // physical board size in threejs
export const boardYLocation = 0.1; // physical board y-coordinate
export const maxCameraRadius = 12; // how far camera can go away from center
export const BaseCharacterSpeed = 2; // base speed, without any speed boost (due to far away)
export const SpeedBoostDistance = 1; // distance from where character starts going faster, to not take too long
export const SpeedBostScale = 2; // When farther than SpeedBoostDistance, how much should speed be multiplied?
export const DistanceArriveThreshold = 0.05; // The threshold for the character to be considered arrived
export const diceStoppedBoardLevel = 0.27; // the Y level that the dice must be below so it is considered as stopped.


export const playerSeparationDistance = 0.35; // the distance to separate the players on each tile

export const housebarHeight = 0.5; // the height of each square occupied by the color-housebar


/* Board Img CONSTS */
// const cornerLengthImg = 215;
// const tileLengthImg = 130;
// const boardImgSize = 1600;
// export const boardimg = require("assets/board.jpg");

/* High RES version! */
export const cornerLengthImg = 855;
export const tileLengthImg = 520;
export const boardImgSize = 6400;
export const boardimg = require("assets/board_high_res.png");
export const boardMaterial = "board"

// house consts
export const housePath = require("assets/models3d/house.stl") as string;
export const houseScale = 0.03;
export const houseMaterial = new MeshStandardMaterial({ color: 0x1ee37d, metalness: 0.3, roughness: 0.2 })
export const hotelMaterial = new MeshStandardMaterial({ color: 0xd42626, metalness: 0.3, roughness: 0.2 })

// cage consts
export const cagePath = require("assets/models3d/cage.stl") as string;
export const cageScale = 5;
export const cageMaterial = new MeshStandardMaterial({ color: 0x786c6b, metalness: 0.4, roughness: 0.2 })
export const jailLocation = new Vector3(-5.6, 0, 4.5);