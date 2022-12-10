
namespace MonopolyClone.Database.Models;



public class GameTile
{
    /// <summary>
    /// The ID of the tile, represents a value between 0-39
    /// </summary>
    required public int tileID { get; set; }

    /// <summary>
    /// An optional property associated to this game tiles.
    /// Not every game tile has a property.
    /// </summary>
    required public Property? property { get; set; }
}