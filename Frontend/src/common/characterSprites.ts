import { PlayerCharacter } from "./characterModelConstants"
import CarPath from "assets/character_sprites/carsprite.png"
import HatPath from "assets/character_sprites/hatsprite.png"
import ShipPath from "assets/character_sprites/shipsprite.png"
import ThimblePath from "assets/character_sprites/thimblesprite.png"
import IronPath from "assets/character_sprites/ironsprite.png"
import Wheelcart from "assets/character_sprites/wheelcartsprite.png"

export const characterToSprite = new Map<number, string>([
  [PlayerCharacter.Car, CarPath],
  [PlayerCharacter.Iron, IronPath],
  [PlayerCharacter.Hat, HatPath],
  [PlayerCharacter.Ship, ShipPath],
  [PlayerCharacter.Wheelcart, Wheelcart],
  [PlayerCharacter.Thimble, ThimblePath],
])