using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class DowngradePropertyEvent
{
    [SocketEvent("downgrade-property")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, int toUpgrade)
    {
        MonopolyGame.Instance.DowngradeProperty(user.Username, toUpgrade);
        MonopolyGame.Instance.PerformGameChecks(); // perform game checks
        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket); // broadcast the update after applying effect
    }

}