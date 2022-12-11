
using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Events;
using MonopolyClone.Json;
using MonopolyClone.TileEffects;
using NLog;
namespace MonopolyClone.Game;

/// <summary>
/// Effect Output,
/// including multiple outcome information after processing all of the game's main effects.
/// </summary>
public struct EffectOutput
{
    public PropertyDeed? toAuction { get; init; }
    public bool isDoubles { get; init; }
};

/// <summary>
/// Gameboard Class. Holds STATIC board information.
/// This is generated on startup and it is intended to not be modified.
/// Things like property value, images, names, etc.
/// </summary>
public class GameBoard
{
    private Logger _logger;
    private GameboardTileCollection _tileCollection;

    public GameBoard()
    {
        _logger = LogManager.GetCurrentClassLogger();
        // read from tiles.json
        var jsonstring = System.IO.File.ReadAllText("gamedata/tiles.jsonc");
        var storedstate = MonopolySerializer.Deserialize<GameboardTileCollection>(jsonstring);

        if (storedstate == null)
            throw new ArgumentException("Could not parse json, stored state is None");

        _tileCollection = storedstate;
    }

    /// <summary>
    /// Handles the board effects of moving a  player.
    /// This includes effectively moving the player, applying on pass through effects (getting GO)
    /// And applying effect once landing.
    ///
    /// Due to properties and many different outcomes. This might yield into a possible auction or not.
    /// This will be notified in the return value.
    /// This will modify the game state,
    /// however no in-state logic such as the current phase of the turn will be modified and need to be handled accordingly.
    /// </summary>
    /// <param name="player">The player of the current turn, to apply most effects to</param>
    /// <param name="diceResult">The result of rolling the dices</param>
    /// <param name="state">The global state reference, will be modified in meomry</param>
    /// <returns>The output of processing the game effects. Will need to be handled properly</returns>
    public EffectOutput HandlePlayerBoardEffects(Player player, int[] diceResult, GameState state)
    {
        int originalLocation = player.location;
        int targetLocation = (player.location + diceResult.Sum()) % BoardConstants.BoardSquares;


        // Apply Passthrough Effects
        int manualWalk = 0;
        while (manualWalk != targetLocation)
        {
            manualWalk++;
            manualWalk %= BoardConstants.BoardSquares;

            // TODO Implement Passthrough Effects
            // _tileCollection.tiles[manualWalk].passtrough_effect.execute
        };

        // Actually set location
        player.location = targetLocation;

        // Apply effect when landing.
        var tileEffect = _tileCollection.tiles[targetLocation].effect;

        if (tileEffect == null)
        {
            // Nothing to auction, nothing special happens. Move on to next turn. Effectively landing in full stop.
            return new EffectOutput() { toAuction = null, isDoubles = (diceResult[0] == diceResult[1]) };
        };

        // Non Special property case. Instead some defined effect.
        // Simply apply effect.
        if (tileEffect.GetType() != typeof(PropertyEffect))
        {
            tileEffect.ExecuteEffect(player, state.players, targetLocation, _tileCollection.tiles);
            return new EffectOutput() { toAuction = null, isDoubles = (diceResult[0] == diceResult[1]) };
        };

        var property = (PropertyEffect)tileEffect;
        // See if property is unpurchased
        PropertyDeed? unpurchasedDeed = null;
        foreach (var unpurchased in state.unpurchasedProperties)
        {
            if (property.propertyID == unpurchased.propertyID)
            {
                unpurchasedDeed = unpurchased;
                break;
            }
        }

        // if property is unpurchased, apply no further effects. go to auction
        if (unpurchasedDeed != null)
        {
            return new EffectOutput() { toAuction = unpurchasedDeed, isDoubles = (diceResult[0] == diceResult[1]) };
        }

        // if property IS purchased. Apply normal property logic according to houses and states.

        tileEffect.ExecuteEffect(player, state.players, targetLocation, _tileCollection.tiles);

        return new EffectOutput() { toAuction = null, isDoubles = (diceResult[0] == diceResult[1]) };
    }
}

