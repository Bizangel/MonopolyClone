
using MonopolyClone.Sockets;
namespace MonopolyClone.Events;


public static class SampleConnectEvent
{
    [OnSocketConnect]
    public static Task SampleConnectionEventRun(UserSocket user, ServerSocketHandler handler)
    {
        // Console.WriteLine($"Received Connection event, user connected!: " + user.Username);
        return Task.CompletedTask;
    }

}