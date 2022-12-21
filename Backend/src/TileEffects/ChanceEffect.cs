
using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;


class ChanceEffect : TileEffect
{
    public override string DescribeEffect(Player player, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        return "";
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
    }
}