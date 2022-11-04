
namespace MonopolyClone.Common;


public static class BoardConstants
{
    /// <summary>
    /// Player starting money when the game starts.
    /// According to default monopoly rules.
    /// </summary>
    public const int StartingPlayerMoney = 1500;

    /// <summary>
    /// How many squares are in the board.
    /// And define the starting and ending point for performing
    /// modulus operation like moving in the board
    /// </summary>
    public const int BoardSquares = 40;
}
