
namespace MonopolyClone.Database.Models;


public class GameState
{
    /// <summary>
    /// The index of the active turn player
    /// </summary>
    public int currentTurn { get; set; }

    /// <summary>
    /// The current players of the game.
    /// </summary>
    public Player[] players { get; set; } = new Player[0];

    public PropertyDeed[] unpurchasedProperties { get; set; } = new PropertyDeed[0];

    public UIState uiState { get; set; } = new UIState();

}