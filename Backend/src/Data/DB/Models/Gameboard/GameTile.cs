

using MonopolyClone.Json;
using MonopolyClone.TileEffects;

namespace MonopolyClone.Database.Models;



public class GameTile
{
    /// <summary>
    /// The ID of the tile, represents a value between 0-39
    /// </summary>
    public int tileID { get; init; }


    public TileEffect? effect { get; init; }

    // public TilePassSpecialEffect specialEffect { get; init; }
}