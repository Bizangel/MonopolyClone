using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class TradeSetOfferEvent
{
    [SocketEvent("trade-offer-set")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, TradeOffer newOffer)
    {
        if (!MonopolyGame.Instance.isTradeRecipient(user.Username) || !MonopolyGame.Instance.IsActiveTrade())
            return;

        MonopolyGame.Instance.SetTradeOffer(user.Username, newOffer);

        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket); // broadcast the update after applying effect
    }

}