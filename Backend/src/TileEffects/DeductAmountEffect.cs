
using MonopolyClone.Database.Models;
using Newtonsoft.Json;

namespace MonopolyClone.TileEffects;


class DeductAmountEffect : TileEffect
{
    [JsonRequired]
    public int deductAmount { get; init; }

    public override string DescribeEffect(Player player, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        return $"Unlucky. {player.name} must pay {deductAmount}";
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        landedPlayer.money -= deductAmount;
    }
}