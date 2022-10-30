using MonopolyClone.Sockets;
namespace MonopolyClone.Events;


public static class OnDiceThrownEvent
{
    [SocketEvent("sampleEvent")]
    public static async Task Run(UserSocket user, string payload, ServerSocketHandler handler)
    {
        Console.WriteLine($"Received Event from {user.Username} with payload {payload}");

        await user.SendEvent("testEvent", "Hello World from Server!");
    }

}