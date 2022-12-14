
using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Events;
using MonopolyClone.Json;
using MonopolyClone.TileEffects;
using NLog;
namespace MonopolyClone.Game;

/// <summary>
/// The Result of rolling a dice and moving a player character.
/// This must be used to then apply the actual game main effects
/// </summary>
public struct RollResult
{
    public PropertyDeed? possibleAuction { get; init; }
    public bool isDoubles { get; init; }
    public bool requiredInput { get; init; }

    public TileEffect? effectToApply { get; init; }
};



/// <summary>
/// Gameboard Class. Holds STATIC board information.
/// This is generated on startup and it is intended to not be modified.
/// Things like property value, images, names, etc.
/// </summary>
public class GameBoard
{
    public void Assert(bool condition, string msg)
    {
        if (!condition)
        {
            throw new ArgumentException(msg);
        }
    }

    private Logger _logger;
    private GameboardTileCollection _tileCollection;

    /// <summary>
    /// Performs verification that all tiles inside tile collection follow expected values.
    /// Raises a ArgumentException if any of the parameters are not as expected.
    /// </summary>
    private void VerifyTiles()
    {
        foreach (var tile in _tileCollection.tiles)
        {
            if (tile.effect == null)
                continue;

            if (tile.effect.GetType() == typeof(PropertyEffect))
            {
                var property = (PropertyEffect)tile.effect;
                Assert(property.cost >= 60 && property.cost <= 400, $"Property {tile.tileID} cost is out of expected range! ${property.cost}");
                if (property.colorGroup == 9)
                { // services
                    Assert(property.rentCost.Length == 2, "Invalid service tile rent cost specifier (invalid length)");
                    Assert(property.rentCost[0] == 4, "Invalid Service Tile Rent Cost Single Multiplier");
                    Assert(property.rentCost[1] == 10, "Invalid Service Tile Rent Cost Double Multiplier");
                }
                else if (property.colorGroup == 8) // transport
                {
                    Assert(property.rentCost.Length == 4, "Invalid Transport Tile Rent Cost specifier (invalid length)");
                    Assert(property.rentCost[0] == 25, "Invalid Transport Tile Rent Cost x1 Multiplier");
                    Assert(property.rentCost[1] == 50, "Invalid Transport Tile Rent Cost x2 Multiplier");
                    Assert(property.rentCost[2] == 100, "Invalid Transport Tile Rent Cost x3 Multiplier");
                    Assert(property.rentCost[3] == 200, "Invalid Transport Tile Rent Cost x4 Multiplier");
                }
                else
                {
                    Assert(property.rentCost.Length == 6, $"Invalid Property Cost Specifier (invalid length) {tile.tileID}");
                    for (int i = 0; i < property.rentCost.Length - 1; i++)
                    {
                        Assert(property.rentCost[i] < property.rentCost[i + 1], $"Not decreasing Tile cost specifier {tile.tileID}");
                    }
                }
            }
        }
    }

    public GameBoard()
    {
        _logger = LogManager.GetCurrentClassLogger();
        // read from tiles.json
        var jsonstring = System.IO.File.ReadAllText("gamedata/tiles.jsonc");
        var storedstate = MonopolySerializer.Deserialize<GameboardTileCollection>(jsonstring);

        if (storedstate == null)
            throw new ArgumentException("Could not parse json, stored state is None");

        _tileCollection = storedstate;
        VerifyTiles();
    }

    /// <summary>
    /// Handles the board effects of moving a player.
    /// This includes effectively moving the player, applying on pass through effects (getting GO)
    ///
    /// Due to properties and many different outcomes. This might yield into a possible auction or not.
    /// This will be notified in the return value.
    /// This will modify the game state,
    /// however no in-state logic such as the current phase of the turn will be modified and need to be handled accordingly.
    ///
    /// This will also effectively determine if a property is unpurchased or not. (whether it needs to be auctioned)
    /// </summary>
    /// <param name="player">The player of the current turn, to apply most effects to</param>
    /// <param name="diceResult">The result of rolling the dices</param>
    /// <param name="state">The global state reference, will be modified in memory</param>
    /// <returns>The output of processing the game effects. Will need to be handled properly</returns>
    public RollResult HandlePlayerDiceRoll(Player player, int[] diceResult, GameState state)
    {
        int originalLocation = player.location;
        int targetLocation = (player.location + diceResult.Sum()) % BoardConstants.BoardSquares;

        // Apply Passthrough Effects
        int manualWalk = originalLocation;
        while (manualWalk != targetLocation)
        {
            manualWalk++;
            manualWalk %= BoardConstants.BoardSquares;

            // TODO Implement Passthrough Effects
            // _tileCollection.tiles[manualWalk].passtrough_effect.execute
        };

        // Actually set location
        player.location = targetLocation;

        // Get Effect to apply
        var tileEffect = _tileCollection.tiles[targetLocation].effect;

        if (tileEffect == null)
        {
            // Nothing to auction, nothing special happens. Move on to next turn. Effectively landing in full stop.
            return new RollResult()
            {
                possibleAuction = null,
                isDoubles = (diceResult[0] == diceResult[1]),
                effectToApply = null,
                requiredInput = false,
            };
        };

        // Non Special property case. Instead some defined effect.
        // Simply return effect to apply. However, input is indeed required.
        if (tileEffect.GetType() != typeof(PropertyEffect))
        {
            return new RollResult()
            {
                possibleAuction = null,
                isDoubles = (diceResult[0] == diceResult[1]),
                requiredInput = true,
                effectToApply = tileEffect,
            };
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

        // if property is unpurchased, then it may be auctioned. Input is required
        if (unpurchasedDeed != null)
        {
            return new RollResult()
            {
                possibleAuction = unpurchasedDeed,
                isDoubles = (diceResult[0] == diceResult[1]),
                effectToApply = property,
                requiredInput = true,
            };
        }

        // if property IS purchased, just a normal effect. Require input for acknowledgement of pay.

        return new RollResult()
        {
            possibleAuction = null,
            isDoubles = (diceResult[0] == diceResult[1]),
            requiredInput = true,
            effectToApply = tileEffect,
        };
    }


    /// <summary>
    /// Applies the given effect to the given player.
    /// Effectively modifying the given state.
    /// </summary>
    public void ApplyEffect(TileEffect effect, Player player, GameState state)
    {
        effect.ExecuteEffect(player, state.players, player.location, _tileCollection.tiles);
    }
}

