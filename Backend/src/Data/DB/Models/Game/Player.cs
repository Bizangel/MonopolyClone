namespace MonopolyClone.Database.Models;

/// <summary>
/// The Player Local Model. Stores the player information.
/// </summary>
public class Player
{
    /// <summary>
    /// The display name of this player.
    /// Uniquely identifiable.
    /// </summary>
    public string name { get; set; } = "";

    /// <summary>
    /// Current Location of player in board.
    /// Represented as an integer from 0 to 39
    /// </summary>
    public int location { get; set; }

    /// <summary>
    /// Current Money of the player.
    /// </summary>
    public int money { get; set; }

    /// <summary>
    /// Current Character of the player.
    /// This refers to Car, Thimble, and similar.
    /// </summary>
    public Character character { get; set; }

    /// <summary>
    /// The properties owned by the player.
    /// </summary>
    public Property[] properties { get; set; } = new Property[0];
}