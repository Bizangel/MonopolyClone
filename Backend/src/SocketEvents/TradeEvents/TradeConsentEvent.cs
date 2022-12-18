using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class TradeConsentEvent
{
    [SocketEvent("trade-consent")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, string consent)
    {
        if (!MonopolyGame.Instance.isTradeRecipient(user.Username) || !MonopolyGame.Instance.IsActiveTrade())
            return;

        if (consent != "accept" && consent != "reject" && consent != "cancel")
            return;

        if (consent == "cancel")
        {
            // cancel trade
            MonopolyGame.Instance.CancelTrade();
        }
        else
        {
            MonopolyGame.Instance.SetTradeConsent(user.Username, consent == "accept");
        }

        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket); // broadcast the update after applying effect
    }

}