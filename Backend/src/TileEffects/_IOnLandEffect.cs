


using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Json;
using Newtonsoft.Json;
namespace MonopolyClone.TileEffects;


[JsonConverter(
  typeof(SubJsonSerializer<TileEffectID>), // specify serializer discriminator
  typeof(TileEffect),// specify base type
  "effectID", // name of discriminator property, must be present in base class
  new TileEffectID[] { TileEffectID.Property, TileEffectID.RawSumEffect, TileEffectID.GoToJailEffect, TileEffectID.CommunityChest, TileEffectID.Chance, TileEffectID.GoToTile, TileEffectID.CollectEffect }, // specify keys
  new Type[] { typeof(PropertyEffect), typeof(RawSumEffect), typeof(GoToJailEffect), typeof(CommunityChestEffect), typeof(ChanceEffect), typeof(GoToTileEffect), typeof(CollectEffect) } // specify keys mapping to json types
  )
]
public abstract class TileEffect
{
    public TileEffectID effectID { get; init; }

    /// <summary>
    /// This method must return in a human readable format, what the effect will do.
    ///
    /// THIS METHOD MUST NOT MODIFY ANY OF THE PLAYERS OR GAME STATE IN ANY WAY. IT IS PROVIDED FOR READONLY PURPOSES.
    ///
    /// e.g. -> This property is owned by <x>, string must pay 30$.
    /// e.g. -> All players need to pay taxes, all players pay 50$.
    /// </summary>
    /// <returns>Human readable string describing what the effect will do when applied.</returns>
    public abstract string DescribeEffect(Player player, List<Player> allPlayers, GameState gameState, Game.GameBoard board);

    /// <summary>
    /// Executes the implemented effect associated with the given game tile,
    /// directly modifying the game state.
    /// </summary>
    /// <param name="landedPlayer">The player that landed in the square</param>
    /// <param name="allPlayers">The full list of players. Beware! landed player is also included.</param>
    /// <param name="gameState">The current state of the game</param>
    /// <param name="board">The board containing list of all 40 game tiles</param>
    public abstract void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, GameState gameState, Game.GameBoard board);
};