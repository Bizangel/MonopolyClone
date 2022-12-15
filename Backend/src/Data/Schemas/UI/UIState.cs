
using MonopolyClone.Common;

namespace MonopolyClone.InterfaceState;

[Serializable]
public class UIState
{
    public int[] displayDices { get; set; } = new int[2] { 3, 3 };

    public TurnPhase turnPhase { get; set; }

    public UIPropertyToBuy? propertyToBuy { get; set; }
};