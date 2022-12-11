


using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Json;
using Newtonsoft.Json;
namespace MonopolyClone.TileEffects;


[JsonConverter(
  typeof(SubJsonSerializer<OnLandEffectID>), // specify serializer discriminator
  typeof(OnLandEffect),// specify base type
  "effectID", // name of discriminator property, must be present in base class
  new OnLandEffectID[] { OnLandEffectID.DeductAmount }, // specify keys
  new Type[] { typeof(DeductAmountEffect) } // specify keys mapping to json types
  )
]
public abstract class OnLandEffect
{
    public OnLandEffectID effectID { get; init; }

    /// <summary>
    /// Executes the implemented effect associated with the given game tile,
    /// directly modifying the game state.
    /// </summary>
    /// <param name="landedPlayer">The player that landed in the square</param>
    /// <param name="allPlayers">The full list of players. Beware! landed player is also included.</param>
    public abstract void ExecuteEffect(Player landedPlayer, List<Player> allPlayers);
};