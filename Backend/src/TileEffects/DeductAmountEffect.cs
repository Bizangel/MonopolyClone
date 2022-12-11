
using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;


class DeductAmountEffect : TileEffect
{
    public int deductAmount { get; init; }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        landedPlayer.money -= deductAmount;
    }
}