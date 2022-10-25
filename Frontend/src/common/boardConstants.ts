/* Board Global Consts */
export const boardSize = 10; // physical board size in threejs
export const boardYLocation = 0.1; // physical board y-coordinate

export const BaseCharacterSpeed = 2; // base speed, without any speed boost (due to far away)
export const SpeedBoostDistance = 1; // distance from where character starts going faster, to not take too long
export const SpeedBostScale = 2; // When farther than SpeedBoostDistance, how much should speed be multiplied?
export const DistanceArriveThreshold = 0.05; // The threshold for the character to be considered arrived

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