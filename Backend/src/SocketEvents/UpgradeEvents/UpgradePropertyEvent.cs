using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class UpgradePropertyEvent
{
    [SocketEvent("upgrade-property")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, int toUpgrade)
    {
        if (!MonopolyGame.Instance.IsPlayerTurn(user.Username) || MonopolyGame.Instance.CurrentTurnPhase != Common.TurnPhase.Standby)
            return;

        if (toUpgrade < 0 || toUpgrade > 27)
            return;

        MonopolyGame.Instance.UpgradeProperty(user.Username, toUpgrade);

        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket); // broadcast the update after applying effect
    }

}