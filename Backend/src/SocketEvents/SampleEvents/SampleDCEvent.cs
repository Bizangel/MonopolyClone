
using MonopolyClone.Sockets;
namespace MonopolyClone.Events;


public static class SampleDCEvent
{
    [OnSocketConnectionLost]
    public static Task OnSocketConnectionLostRun(string dc_user, ServerSocketHandler handler)
    {
        Console.WriteLine($"Received DC event, user disconnected: " + dc_user);
        return Task.CompletedTask;
    }

}