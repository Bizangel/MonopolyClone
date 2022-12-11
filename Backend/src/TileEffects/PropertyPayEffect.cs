using MonopolyClone.Database.Models;

namespace MonopolyClone.TileEffects;

/// <summary>
/// The effect of a property being a property.
/// </summary>
class PropertyEffect : TileEffect
{
    /// <summary>
    /// Effectively the ID of the property. Not to be confused with the TileID.
    /// An unique identifier for "Ownable Properties" from 0-27 (total 28 properties)
    /// These are in sequential order, first as their color, (according to convention defined below)
    /// Ex:
    /// 0, 1 maps to first 2 brown properties.
    /// 2, 3, 4 maps to the following lightblue properties (Despite there being a transport in between those two colors)
    /// 22, 23, 24, 25 maps to transport properties
    /// 26, 27 maps to services
    /// </summary>
    /// <value></value>
    public int propertyID { get; init; }

    /// <summary>
    /// Color group that this game tile belongs. Some game tiles don't necessarily have any associated group.
    /// Code is as follows
    /// 0 -> Brown
    /// 1 -> LightBlue
    /// 2 -> Pink
    /// 3 -> Orange
    /// 4 -> Red
    /// 5 -> Yellow
    /// 6 -> Green
    /// 7 -> Blue
    /// 8 -> Black (Transport)
    /// 9 -> Gray (Services Properties)
    /// </summary>
    /// <value></value>
    public int colorGroup { get; init; }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {

        // TODO Implement Housing Upgrades (shouldn't be too difficult)

        // TODO Implement Color Scaling

        // TODO Implement proper actual scaling lol

        // TODO check if property owner to not reomve money to same owner.

        // Because this is being executed, we know the property IS owned efectively.
        landedPlayer.money -= 100;
    }
}