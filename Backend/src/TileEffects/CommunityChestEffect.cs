
using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;


class CommunityChestEffect : TileEffect
{
    public override string DescribeEffect(Player player, List<Player> allPlayers, int currentTileIndex, Game.GameBoard gameBoard)
    {
        gameBoard.BoardCards.communityChestCards.Shuffle();
        return gameBoard.BoardCards.communityChestCards[0].description;
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, int currentTileIndex, Game.GameBoard gameBoard)
    {
        // this is actually quite risky, cuz we expect describe effect to be called first.
        // that will shuffle
        // Which will be called 99% of the times. At least for this effect.
        var CommunityChestCard = gameBoard.BoardCards.communityChestCards[0];
        CommunityChestCard.effect.ExecuteEffect(landedPlayer, allPlayers, currentTileIndex, gameBoard);
    }
}