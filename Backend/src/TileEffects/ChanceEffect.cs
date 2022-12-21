
using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;


class ChanceEffect : TileEffect
{
    public override string DescribeEffect(Player player, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        gameBoard.BoardCards.chanceCards.Shuffle();
        return gameBoard.BoardCards.chanceCards[0].description;
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        // this is actually quite risky, cuz we expect describe effect to be called first.
        // that will shuffle
        // Which will be called 99% of the times. At least for this effect.
        var ChanceCard = gameBoard.BoardCards.chanceCards[0];
        ChanceCard.effect.ExecuteEffect(landedPlayer, allPlayers, gameState, gameBoard);
    }
}