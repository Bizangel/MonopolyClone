
using MonopolyClone.Sockets;
namespace MonopolyClone.Events;


public static class SampleConnectEvent
{
    [OnSocketConnect]
    public static Task SampleConnectionEventRun(UserSocket user, ServerSocketHandler handler)
    {
        return Task.CompletedTask;
    }

}