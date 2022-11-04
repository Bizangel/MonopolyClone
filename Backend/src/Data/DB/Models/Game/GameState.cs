
namespace MonopolyClone.Database.Models;


public class GameState
{
    /// <summary>
    /// Nice
    /// </summary>
    public int CurrentTurn { get; set; }

    /// <summary>
    /// The current players of the game.
    /// </summary>
    public Player[] Players { get; set; } = new Player[0];

}