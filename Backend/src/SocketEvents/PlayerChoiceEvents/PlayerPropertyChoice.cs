using MonopolyClone.Common;
using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class PropertyChoiceEvent
{
    [SocketEvent("property-choice")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, string payload)
    {
        if (!MonopolyGame.Instance.IsPlayerTurn(user.Username) || !MonopolyGame.Instance.IsPropertyWaitingOnAuctionChoice())
            return;

        if (payload != "buy" || payload != "auction")
            return;

        bool willAuction = payload == "auction";

        MonopolyGame.Instance.PlayerMakePropertyAuctionChoice(willAuction); // make the choice.

        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket); // broadcast the update after choice
    }

}