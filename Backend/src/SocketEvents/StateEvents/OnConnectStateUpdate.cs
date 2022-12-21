using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;


public static class OnConnectStateUpdate
{
    [OnSocketConnect]
    public static async Task OnConnectStateUpdateRun(UserSocket user, ServerSocketHandler handler)
    {
        Console.WriteLine($"This dude connected {user.Username}");
        // if for ex in lobby, don't give state update
        if (MonopolyGame.Instance.ListeningEventLabel != EventLabel.Default &&
            MonopolyGame.Instance.ListeningEventLabel != EventLabel.GameDone)
            return;


        Console.WriteLine($"User connected: {user.Username}, updating him with latest state");

        await MonopolyGame.Instance.BroadcastStateUpdate(handler); // broadcast update so other knows he connected
    }

}