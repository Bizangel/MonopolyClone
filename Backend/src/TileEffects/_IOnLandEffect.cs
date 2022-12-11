


using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Json;
using Newtonsoft.Json;
namespace MonopolyClone.TileEffects;


[JsonConverter(
  typeof(SubJsonSerializer<TileEffectID>), // specify serializer discriminator
  typeof(TileEffect),// specify base type
  "effectID", // name of discriminator property, must be present in base class
  new TileEffectID[] { TileEffectID.Property, TileEffectID.DeductAmount }, // specify keys
  new Type[] { typeof(PropertyEffect), typeof(DeductAmountEffect) } // specify keys mapping to json types
  )
]
public abstract class TileEffect
{
    public TileEffectID effectID { get; init; }

    /// <summary>
    /// Executes the implemented effect associated with the given game tile,
    /// directly modifying the game state.
    /// </summary>
    /// <param name="landedPlayer">The player that landed in the square</param>
    /// <param name="allPlayers">The full list of players. Beware! landed player is also included.</param>
    /// <param name="currentTileIndex">The index of the current tile which current effect is being executed.
    /// In some very rare cases these might not be the same tile as the player position</param>
    /// <param name="gameTiles">The list of all 40 game tiles</param>
    public abstract void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles);
};