import React from "react"
import { Vector3 } from "three"
import * as bc from 'common/boardConstants'
import { getInwardDirection, tileToWorldLocation } from "utils/boardHelpers"
import { CharacterModel } from "./CharacterModel"
import { useGameState } from "gameState/gameState"


// Only manages logic of multiple characters meshes and locations (not actual playability, just display)
export function PlayerModelHandler() {
  const players = useGameState(e => e.players)
  var models: JSX.Element[] = []

  var locationStackedPlayers = new Map<number, number>();
  var locations_taken = new Map<number, number>();

  // Count how many players are in the same square
  players.forEach((player) => {
    var count = locationStackedPlayers.get(player.location);
    locations_taken.set(player.location, 0);
    if (count === undefined)
      locationStackedPlayers.set(player.location, 1);
    else
      locationStackedPlayers.set(player.location, count + 1)
  })

  players.forEach((player) => {
    var onStopLocation: Vector3 | undefined = undefined;
    var stackedPlayers = locationStackedPlayers.get(player.location);
    if (stackedPlayers !== undefined && stackedPlayers > 1) {
      var resolvedPosPlayers = locations_taken.get(player.location);

      if (resolvedPosPlayers === undefined)
        throw new Error("Locations_taken not properly initialized!");

      var loc = tileToWorldLocation(player.location);
      var topmidpoint = new Vector3()
      topmidpoint.addVectors(loc.topleft, loc.topright);
      topmidpoint.divideScalar(2);

      var sepDir = getInwardDirection(player.location);
      sepDir.multiplyScalar(-1);

      topmidpoint.add(sepDir.clone().multiplyScalar(bc.housebarHeight)); // offset by housebar

      topmidpoint.add(sepDir.clone().multiplyScalar(bc.playerSeparationDistance * (resolvedPosPlayers))); // offset according to players

      onStopLocation = topmidpoint;

      locations_taken.set(player.location, resolvedPosPlayers + 1)
    }

    models.push(
      <CharacterModel currentTile={player.location} baseRotation={[Math.PI / 2, 0, 0]} yoffset={0.12} character={player.character} key={player.character}
        onStopLocation={onStopLocation} />
    )
  })

  return (
    <React.Fragment>
      {models}
    </React.Fragment>
  )
}
