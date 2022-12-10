
namespace MonopolyClone.TileEffects;

using MonopolyClone.Database.Models;

interface IOnLandEffect
{
    /// <summary>
    /// Executes the implemented effect associated with the given game tile,
    /// directly modifying the game state.
    /// </summary>
    /// <param name="landedPlayer">The player that landed in the square</param>
    /// <param name="allPlayers">The full list of players. Beware! landed player is also included.</param>
    public void ExecuteEffect(Player landedPlayer, List<Player> allPlayers);
};