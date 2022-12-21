import { useGameState } from "gameState/gameState"
import { GameTileHouse } from "./GameTileHouse"
import { propertyIDtoTilePos } from "common/propertiesMapping";
import { getInwardDirection, getProperHouseRotation, tileToWorldLocation } from "utils/boardHelpers";
import * as THREE from "three";
import { propertyToColor } from "common/propertyConstants";



function GameHouseProperPosition(props: { tileNumber: number, houseIndex: number, hotel?: boolean }) {
  const backToSquareOffset = 0.35;
  const initialFixOffset = 0.03;
  const perHouseOffset = 0.19;

  const pos = tileToWorldLocation(props.tileNumber);
  pos.topleft.y = 0.05;

  const inwardDirection = getInwardDirection(props.tileNumber);
  const offsetDirection = inwardDirection.clone();
  offsetDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

  var vecresult = pos.topleft.clone();
  // vecresult.add(direction);
  var fixOffsetVector = offsetDirection.clone().multiplyScalar(-initialFixOffset);
  var backToSquareOffsetVector = inwardDirection.clone().multiplyScalar(-backToSquareOffset);

  // moves house back to square "house lane"
  vecresult.add(backToSquareOffsetVector)
  // moves slightly left so it matches with start
  vecresult.add(fixOffsetVector);
  // move accordingt to house offset
  vecresult.add(offsetDirection.clone().multiplyScalar(props.houseIndex * perHouseOffset));

  var hotelRotationOffset = 0;
  if (props.hotel) {
    // little back
    vecresult.add(inwardDirection.clone().multiplyScalar(0.03));
    // little left
    vecresult.add(offsetDirection.clone().multiplyScalar(-0.12));
    // rotate
    hotelRotationOffset = Math.PI / 2;
    // little tweaks so it looks nicer
    vecresult.add(offsetDirection.clone().multiplyScalar(props.houseIndex * perHouseOffset));
  }

  return (
    <GameTileHouse position={vecresult}
      rotation={[0, getProperHouseRotation(props.tileNumber) + hotelRotationOffset, 0]} hotel={props.hotel} />
  )
};

function GameHousePack(props: { propertyID: number, upgradeLevel: number }) {
  var location = propertyIDtoTilePos.get(props.propertyID);
  if (location === undefined) {
    throw new Error(`Tile location for property with ID: ${props.propertyID} not found in GameHousePack`);
  }

  if (props.upgradeLevel < 0)
    return null; // no house display

  var range = [...Array(props.upgradeLevel).keys()];

  if (props.upgradeLevel === 5) {
    return <GameHouseProperPosition tileNumber={location ? location : 0} houseIndex={2} hotel />
  }

  return (
    <>
      {
        range.map(element =>
          <GameHouseProperPosition tileNumber={location ? location : 0} key={element} houseIndex={element} />
        )
      }
    </>
  )
};

export function GameHouseHandler() {

  const players = useGameState(e => e.players);

  var housePacks: React.ReactNode[] = [];

  players.forEach(e => e.properties.forEach(prop => {
    var color = propertyToColor(prop.propertyID);
    if (color === "black" || color === "gray") // not upgradable
      return;

    housePacks.push(<GameHousePack upgradeLevel={prop.upgradeState} propertyID={prop.propertyID} key={prop.propertyID} />);
  }))
  return (
    <>
      {housePacks}
    </>
  )
}