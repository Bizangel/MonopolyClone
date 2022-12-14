
using MonopolyClone.Common;

[Serializable]
public class UIState
{
    public int[] displayDices { get; set; } = new int[2] { 3, 3 };

    public TurnPhase turnPhase { get; set; }
};