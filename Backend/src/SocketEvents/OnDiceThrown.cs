using MonopolyClone.Sockets;
namespace MonopolyClone.Events;

// [Serializable]
// [JsonObject()]
public class CustomEventSchema
{
    public string info { get; } = "";
}

public static class OnDiceThrownEvent
{
    [SocketEvent("dice-thrown-start")]
    public static void Run(UserSocket user, ServerSocketHandler handler, CustomEventSchema payload)
    {
        Console.WriteLine($"Received Dice start with payload {payload.info}");
    }

}