
namespace MonopolyClone.Database.Models;


public class GameState
{
    /// <summary>
    /// Nice
    /// </summary>
    public int currentTurn { get; set; }

    /// <summary>
    /// The current players of the game.
    /// </summary>
    public Player[] players { get; set; } = new Player[0];

}