
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

    /// <summary>
    /// The amount of properties in the game.
    /// Also defines all of the possible property ids.
    /// </summary>
    public const int NProperties = 28;

    public static readonly int[] UpgradePrices = new int[] { 50, 100, 150, 200 };
}
