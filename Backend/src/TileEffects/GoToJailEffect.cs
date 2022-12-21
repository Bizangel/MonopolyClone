
using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;


class GoToJailEffect : TileEffect
{
    public override string DescribeEffect(Player player, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        return $"{player.name} is going to jail!";
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        landedPlayer.location = 10; // set jail location
        landedPlayer.jailCount = 0; // now officially in jail
    }
}