
using MonopolyClone.Common;
using MonopolyClone.Game;
namespace MonopolyClone.InterfaceState;

[Serializable]
public class UIState
{
    public int[] displayDices { get; set; } = new int[2] { 3, 3 };

    public bool hasPurchasedUpgrade { get; set; }

    public TurnPhase turnPhase { get; set; }

    public UIPropertyToBuy? propertyToBuy { get; set; }

    public EffectToApply? effectToAcknowledge { get; set; }

    public Auction? currentAuction { get; set; }

    public TradeState? currentTrade { get; set; }

    /// <summary>
    /// List of boolean that displays how whether the current player is connected or not.
    /// This matches exactly to the indexes of the game turn
    /// </summary>
    /// <value></value>
    public bool[] connectedUpkeep { get; set; } = new bool[0];
};