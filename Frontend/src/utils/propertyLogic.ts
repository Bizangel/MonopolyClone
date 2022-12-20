import { Player } from "gameState/gameState";


export function getPropertyUpgradeLevel(players: Player[], propertyID: number): number {
  var foundLevel: number | undefined = undefined;
  players.forEach((player) => {
    player.properties.forEach((e => {
      if (e.propertyID === propertyID)
        foundLevel = e.upgradeState;
    }))
  });

  return foundLevel ? foundLevel : 0;
};