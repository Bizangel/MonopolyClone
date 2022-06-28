import React from "react"
import { CharacterModel } from "./CharacterModel"
import { PlayerCharacter } from "./PlayerCharacterCommons"

type PlayerLocationHandlerProps = {
  position: number
}


// Only manages logic of multiple characters
export function PlayerModelHandler(props: PlayerLocationHandlerProps) {
  return (
    <React.Fragment>
      <CharacterModel currentTile={12} baseRotation={[Math.PI / 2, 0, 0]} yoffset={0.12} character={PlayerCharacter.Thimble} />
      <CharacterModel currentTile={24} baseRotation={[Math.PI / 2, 0, 0]} yoffset={0.12} character={PlayerCharacter.Car} />
    </React.Fragment>
  )
}
