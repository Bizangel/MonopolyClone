
using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Game;
namespace MonopolyClone.InterfaceState;

[Serializable]
public class GameResults
{
    public List<Player> players { get; set; } = new List<Player>();

    public List<int> netWorth { get; set; } = new List<int>();
};