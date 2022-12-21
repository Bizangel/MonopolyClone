
using MonopolyClone.Game;
using MonopolyClone.Sockets;

namespace MonopolyClone.Events;


public static class SampleDCEvent
{
    [OnSocketConnectionLost]
    public static async Task OnSocketConnectionLostRun(string dc_user, ServerSocketHandler handler)
    {
        Console.WriteLine($"Received DC event, user disconnected: " + dc_user);
        await MonopolyGame.Instance.BroadcastStateUpdate(handler); // broadcast update so other knows he dced
    }

}