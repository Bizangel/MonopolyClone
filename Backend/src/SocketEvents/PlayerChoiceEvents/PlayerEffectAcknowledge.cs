using MonopolyClone.Common;
using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class EffectAcknowledgeEvent
{
    [SocketEvent("effect-acknowledge")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, string payload)
    {
        if (!MonopolyGame.Instance.IsPlayerTurn(user.Username) || !MonopolyGame.Instance.IsEffectWaitingOnAcknowledge())
            return;

        MonopolyGame.Instance.PlayerAcknowledgeEffect(); // apply the acknowledgement. Effectively applying any effect

        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket); // broadcast the update after applying effect
    }

}