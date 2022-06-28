import { Vec3 } from "cannon-es"

/* Board Global Consts */
export const boardSize = 10;
export const boardYLocation = 0.1;

const cornerLengthImg = 215;
const tileLengthImg = 130;
const boardImgSize = 1600;

export function imagepixels_to_tileindex(x: number, y: number) {
  var hallway_idx = -1;
  var detectvar = -1;
  if (y < cornerLengthImg) {
    hallway_idx = 3; // third one up
    detectvar = x;
  } else if (y > boardImgSize - cornerLengthImg) {
    hallway_idx = 1; // first one up
    detectvar = boardImgSize - x;
  } else if (x < cornerLengthImg) {
    hallway_idx = 2;
    detectvar = boardImgSize - y;
  } else if (x > boardImgSize - cornerLengthImg) {
    hallway_idx = 4;
    detectvar = y;
  }

  if (hallway_idx === -1)
    return;

  var detected: number | null = null;
  if (detectvar < cornerLengthImg) {
    detected = 0;
  } else if (detectvar > boardImgSize - cornerLengthImg) {
    detected = 10
  } else {
    for (detected = 0; detected < 9; detected++) {
      var helpLoc = detectvar - cornerLengthImg; // location removing corner
      if (
        (detected * tileLengthImg < helpLoc) && (
          helpLoc < (detected + 1) * tileLengthImg)) {
        detected += 1;
        break
      }
    }
  }

  var tileIndex = (hallway_idx - 1) * 10 + detected;
  return tileIndex
}

type TileLocation = {
  topleft: Vec3,
  topright: Vec3,
  botleft: Vec3,
  botright: Vec3
}


export function getMidPoint(loc: TileLocation) {
  return loc.botleft.vadd(loc.botright).vadd(loc.topleft).vadd(loc.topright).scale(1 / 4);
}

function pixelToBoardXZ(px: number) {
  return px / boardImgSize * boardSize - boardSize / 2
}

const board_bottom = boardSize / 2;
const board_top = - boardSize / 2;

const board_left = - boardSize / 2;
const board_right = boardSize / 2;

const firstrow_topy = pixelToBoardXZ(boardImgSize - cornerLengthImg);
const secondrow_rightx = pixelToBoardXZ(cornerLengthImg);
const thirdrow_bottomy = pixelToBoardXZ(cornerLengthImg);
const fourthrow_leftx = pixelToBoardXZ(boardImgSize - cornerLengthImg);

const cornerBoardLength = cornerLengthImg / boardImgSize * boardSize;
const tileBoardLength = tileLengthImg / boardImgSize * boardSize;

function XZVector(x: number, z: number) {
  return new Vec3(x, boardYLocation, z);
}

// Returned locations are relative to tile directioning!
export function tileToWorldLocation(tileIndex: number): TileLocation {

  if (tileIndex === 0) { // GO tile
    return {
      topleft: XZVector(board_right - cornerBoardLength, board_bottom - cornerBoardLength), topright: XZVector(board_right, board_bottom - cornerBoardLength),
      botleft: XZVector(board_right - cornerBoardLength, board_bottom), botright: XZVector(board_right, board_bottom)
    }
  }

  if (tileIndex === 10) { // JAIL
    return {
      botleft: XZVector(board_left, board_bottom - cornerBoardLength), topleft: XZVector(board_left + cornerBoardLength, board_bottom - cornerBoardLength),
      botright: XZVector(board_left, board_bottom), topright: XZVector(board_left + cornerBoardLength, board_bottom)
    }
  }

  if (tileIndex === 20) { // FREE STOP
    return {
      botright: XZVector(board_left, board_top), botleft: XZVector(board_left + cornerBoardLength, board_top),
      topright: XZVector(board_left, board_top + cornerBoardLength), topleft: XZVector(board_left + cornerBoardLength, board_top + cornerBoardLength)
    }
  }

  if (tileIndex === 30) { // GO TO JAIL SQUARE
    return {
      topright: XZVector(board_right - cornerBoardLength, board_top), botleft: XZVector(board_right, board_top),
      topleft: XZVector(board_right - cornerBoardLength, board_top + cornerBoardLength), botright: XZVector(board_right, board_top + cornerBoardLength)
    }
  }

  var row = -1;
  if (0 <= tileIndex && tileIndex < 10)
    row = 1;
  else if (10 <= tileIndex && tileIndex < 20)
    row = 2;
  else if (20 <= tileIndex && tileIndex < 30)
    row = 3;
  else
    row = 4;


  // console.log("row: " + row)
  var offset = ((tileIndex % 10) - 1) * tileBoardLength + cornerBoardLength;
  switch (row) {
    case 1:
      var rightx = board_right - offset;
      var leftx = rightx - tileBoardLength;

      return {
        topleft: XZVector(leftx, firstrow_topy), topright: XZVector(rightx, firstrow_topy),
        botleft: XZVector(leftx, board_bottom), botright: XZVector(rightx, board_bottom)
      }

    case 2:
      var bottomy = board_bottom - offset;
      var topy = bottomy - tileBoardLength;

      return {
        botleft: XZVector(board_left, topy), topleft: XZVector(secondrow_rightx, topy),
        botright: XZVector(board_left, bottomy), topright: XZVector(secondrow_rightx, bottomy)
      }

    case 3:
      var leftx2 = board_left + offset;
      var rightx2 = leftx2 + tileBoardLength;

      return {
        botright: XZVector(leftx2, board_top), botleft: XZVector(rightx2, board_top),
        topright: XZVector(leftx2, thirdrow_bottomy), topleft: XZVector(rightx2, thirdrow_bottomy)
      }

    case 4:
      var topy2 = board_top + offset;
      var boty = topy2 + tileBoardLength;

      return {
        topright: XZVector(fourthrow_leftx, topy2), botright: XZVector(board_right, topy2),
        topleft: XZVector(fourthrow_leftx, boty), botleft: XZVector(board_right, boty)
      }
    default:
      throw new Error("invalid tileIndex given in tileToWorldLocation")
  }
}