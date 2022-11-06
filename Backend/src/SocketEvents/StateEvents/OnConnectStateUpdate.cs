using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;


public static class OnConnectStateUpdate
{
    [OnSocketConnect]
    public static async Task SampleConnectionEventRun(UserSocket user, ServerSocketHandler handler)
    {
        // TODO verify that the game is actually started i.e not in lobby, before broadcasting update
        var gameState = MonopolyGame.Instance.GetStateUpdate();
        Console.WriteLine($"User connected: {user.Username} with latest state");

        await user.Emit("state-update", gameState);
    }

}