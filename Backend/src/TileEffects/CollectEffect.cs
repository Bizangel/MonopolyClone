using MonopolyClone.Database.Models;
using Newtonsoft.Json;

namespace MonopolyClone.TileEffects;


class CollectEffect : TileEffect
{
    [JsonRequired]
    public int collectAmount { get; init; }

    public override string DescribeEffect(Player player, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        return "";
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        allPlayers.ForEach(e =>
        {
            e.money -= collectAmount;
            landedPlayer.money += collectAmount; // if it's the same player doesn't change!
        });
    }
}