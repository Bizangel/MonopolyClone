
using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;


class DeductAmountEffect : IOnLandEffect
{
    public int deductAmount { get; init; }

    public void ExecuteEffect(Player landedPlayer, List<Player> allPlayers)
    {
        landedPlayer.money -= deductAmount;
    }
}