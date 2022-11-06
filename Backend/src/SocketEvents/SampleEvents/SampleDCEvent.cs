
using MonopolyClone.Sockets;
namespace MonopolyClone.Events;


public static class SampleDCEvent
{
    [OnSocketConnectionLost]
    public static void OnSocketConnectionLostRun(string dc_user)
    {
        Console.WriteLine($"Received DC event, user disconnected: " + dc_user);
    }

}