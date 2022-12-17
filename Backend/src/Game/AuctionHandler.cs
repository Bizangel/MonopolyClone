
namespace MonopolyClone.Game;

using System.Collections.Concurrent;

public class Auction
{
    public List<Bid> bids { get; set; } = new List<Bid>();
    public int topBid = 0; // index to highest bidder

    public long currentAuctionDeadline = 0; // unix timestamp until it ends

    public int auctionedProperty = 0;
};


public struct Bid
{
    public string bidder;
    public int bidAmount;
}


public static class AuctionHandler
{
    private static ConcurrentQueue<Bid> bidQueue = new ConcurrentQueue<Bid>();
    public static readonly int auctionDurationSeconds = 10;


    public static void PlaceBid(Bid newBid)
    {
        bidQueue.Enqueue(newBid);
    }

    /// <summary>
    /// Starts a new auction.
    /// Expects an initialized Auction object
    /// </summary>
    /// <param name="toUpdate">An Auction object to dynamically update.</param>
    /// <param name="updateBroadcast">A callback to execute everytime there's a new highest bidder in the auction.</param>
    /// <param name="finishAuctionCallback">A callback to execute when the auction finishes</param>
    /// <param name="MaxBidPerPlayer">A list specifying the max amount that a player can bid. Past this value the player bids will be ignored</param>
    public static void StartAuction(
      Auction toUpdate,
      Action updateBroadcast,
      Action finishAuctionCallback,
      int[] MaxBidPerPlayer)
    {
        Task.Run(() => { AuctionLoop(toUpdate, updateBroadcast, finishAuctionCallback, MaxBidPerPlayer); });
    }

    /// <summary>
    /// The effective auction loop. Expected to be called with an initialized auction object (i.e. names and all bids set 1)
    /// </summary>
    /// <param name="auction">The auction object to dynamically update</param>
    /// <param name="onAuctionUpdate">A callback to execute every time the auction changes (a higher bid is given)</param>
    /// <param name="onFinishAuction">The action to execute after finishing the auction, with the given auction bid winner</param>
    /// <param name="MaxBidPerPlayer">A list specifying the max amount that a player can bid. Past this value the player bids will be ignored</param>
    /// <returns></returns>
    public static Task AuctionLoop(
      Auction auction,
      Action onAuctionUpdate,
      Action onFinishAuction,
      int[] MaxBidPerPlayer)
    {
        while (true)
        {
            bool wasDifference = false;

            // check if I have any new bid requests.
            while (!bidQueue.IsEmpty)
            {
                Bid toProcess;
                bool succ = bidQueue.TryDequeue(out toProcess);
                if (succ)
                {
                    // process bid
                    if (toProcess.bidAmount > auction.bids[auction.topBid].bidAmount)
                    {
                        // update best dude's display bid in list
                        var bestIndex = auction.bids.FindIndex((e) => e.bidder == toProcess.bidder);

                        // verify that bid is legit, can actually bid that much
                        if (toProcess.bidAmount > MaxBidPerPlayer[bestIndex])
                            continue; // doesn't have that much money

                        auction.bids[bestIndex] = toProcess; // set new bid
                        auction.topBid = bestIndex; // set new best
                        auction.currentAuctionDeadline = (
                          DateTimeOffset.Now.ToUnixTimeMilliseconds() + (long)auctionDurationSeconds * 1000);// set new deadline
                        wasDifference = true;
                    }
                }
            }



            if (wasDifference)
            {
                onAuctionUpdate();
            }

            Thread.Sleep(100); // allows enough space for things to happen, but also not too much delay

            // check if deadline has been met
            if (DateTimeOffset.Now.ToUnixTimeMilliseconds() > auction.currentAuctionDeadline)
                break; // done

        }

        onFinishAuction();
        // clear bids
        bidQueue.Clear();
        return Task.CompletedTask;
    }
}
