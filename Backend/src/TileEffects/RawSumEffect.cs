
using MonopolyClone.Database.Models;
using Newtonsoft.Json;

namespace MonopolyClone.TileEffects;


class RawSumEffect : TileEffect
{
    [JsonRequired]
    public int sumAmount { get; init; }

    [JsonRequired]
    public string description { get; init; } = "";

    public override string DescribeEffect(Player player, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        return description;
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        landedPlayer.money += sumAmount;
    }
}