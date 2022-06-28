import { CharacterModel } from "./CharacterModel"


type PlayerLocationHandlerProps = {
  position: number
}


// Only manages logic of multiple characters
export function PlayerModelHandler(props: PlayerLocationHandlerProps) {



  return (
    <CharacterModel displayScale={0.002} currentTile={2} />
  )
}
