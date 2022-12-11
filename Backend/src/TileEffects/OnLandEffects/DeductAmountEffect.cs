
using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;


class DeductAmountEffect : OnLandEffect
{
    public int deductAmount { get; init; }

    public override void ExecuteEffect(Player landedPlayer, List<Player> allPlayers)
    {
        landedPlayer.money -= deductAmount;
    }
}