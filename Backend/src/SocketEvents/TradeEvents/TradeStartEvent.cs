using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class StartTradeEvent
{
    [SocketEvent("start-trade")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, string toTradeWith)
    {
        if (!MonopolyGame.Instance.IsPlayerTurn(user.Username) || MonopolyGame.Instance.IsActiveTrade())
            return;

        if (user.Username == toTradeWith) // cannot trade with yourself
            return;

        if (!MonopolyGame.Instance.IsGameCurrentPlayer(toTradeWith)) // player needs to exist, or at least not be spectator...
            return;

        MonopolyGame.Instance.StartTrade(user.Username, toTradeWith);

        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket); // broadcast update
    }

}