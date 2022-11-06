using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;


public static class OnConnectStateUpdate
{
    [OnSocketConnect]
    public static async Task SampleConnectionEventRun(UserSocket user, ServerSocketHandler handler)
    {
        // if for ex in lobby, don't give state update
        if (MonopolyGame.Instance.ListeningEventLabel != EventLabel.Default)
            return;

        var gameState = MonopolyGame.Instance.GetStateUpdate();
        Console.WriteLine($"User connected: {user.Username}, updating him with latest state");

        await user.Emit("state-update", gameState);
    }

}