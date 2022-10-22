import React from "react"
import { Vector3 } from "three"
import * as bc from 'common/boardConstants'
import { getInwardDirection, tileToWorldLocation } from "utils/boardHelpers"
import { CharacterModel } from "./CharacterModel"
import { PlayerCharacter } from "common/characterModelConstants"

type PlayerLocationHandlerProps = {
  locations: Map<PlayerCharacter, number>,
}

// Only manages logic of multiple characters meshes and locations (not actual playability, just display)
export function PlayerModelHandler(props: PlayerLocationHandlerProps) {
  var models: JSX.Element[] = []

  var locationStackedPlayers = new Map<number, number>();
  var locations_taken = new Map<number, number>();

  // Count how many players are in the same square
  props.locations.forEach((location, character) => {
    var count = locationStackedPlayers.get(location);
    locations_taken.set(location, 0);
    if (count === undefined)
      locationStackedPlayers.set(location, 1);
    else
      locationStackedPlayers.set(location, count + 1)
  })

  props.locations.forEach((location, character) => {
    var onStopLocation: Vector3 | undefined = undefined;
    var stackedPlayers = locationStackedPlayers.get(location);
    if (stackedPlayers !== undefined && stackedPlayers > 1) {
      var resolvedPosPlayers = locations_taken.get(location);

      if (resolvedPosPlayers === undefined)
        throw new Error("Locations_taken not properly initialized!");

      var loc = tileToWorldLocation(location);
      var topmidpoint = new Vector3()
      topmidpoint.addVectors(loc.topleft, loc.topright);
      topmidpoint.divideScalar(2);

      var sepDir = getInwardDirection(location);
      sepDir.multiplyScalar(-1);

      topmidpoint.add(sepDir.clone().multiplyScalar(bc.housebarHeight)); // offset by housebar

      topmidpoint.add(sepDir.clone().multiplyScalar(bc.playerSeparationDistance * (resolvedPosPlayers))); // offset according to players

      onStopLocation = topmidpoint;

      locations_taken.set(location, resolvedPosPlayers + 1)
    }

    models.push(
      <CharacterModel currentTile={location} baseRotation={[Math.PI / 2, 0, 0]} yoffset={0.12} character={character} key={character}
        onStopLocation={onStopLocation} />
    )
  })

  return (
    <React.Fragment>
      {models}
    </React.Fragment>
  )
}
