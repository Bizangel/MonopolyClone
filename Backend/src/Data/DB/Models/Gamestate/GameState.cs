
namespace MonopolyClone.Database.Models;


public class GameState
{
    /// <summary>
    /// The index of the active turn player
    /// </summary>
    required public int currentTurn { get; set; }

    /// <summary>
    /// The current players of the game.
    /// </summary>
    required public List<Player> players { get; set; }

    required public List<PropertyDeed> unpurchasedProperties { get; set; }

    required public UIState uiState { get; set; }
}