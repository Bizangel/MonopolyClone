
using MonopolyClone.InterfaceState;
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
    public List<Player> players { get; set; } = new List<Player>();

    public List<PropertyDeed> unpurchasedProperties { get; set; } = new List<PropertyDeed>();

    public UIState uiState { get; set; } = new UIState();
}