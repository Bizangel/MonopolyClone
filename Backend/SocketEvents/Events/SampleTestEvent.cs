
using MonopolyClone.Sockets;
namespace MonopolyClone.Events;


public static class SampleTestEvent
{
    private static int sampleAttribute = 3;

    [SocketEvent("sampleEvent")]
    public static void Run(string user, string payload, ServerSocketHandler handler)
    {
        Console.WriteLine("Called Event." + sampleAttribute);
    }

}