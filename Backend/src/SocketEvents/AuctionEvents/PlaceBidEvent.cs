using MonopolyClone.Common;
using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;

public static class PropertyPlaceBidEvent
{
    [SocketEvent("auction-place-bid")]
    public static Task Run(UserSocket user, ServerSocketHandler serversocket, int bidAmount)
    {
        if (!MonopolyGame.Instance.IsGameCurrentPlayer(user.Username) || !MonopolyGame.Instance.IsAuctionRunning())
            return Task.CompletedTask;

        // place an auction
        Bid newbid;
        newbid.bidAmount = bidAmount;
        newbid.bidder = user.Username;

        AuctionHandler.PlaceBid(newbid);
        return Task.CompletedTask;
    }

}