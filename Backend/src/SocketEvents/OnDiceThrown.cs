using MonopolyClone.Sockets;
namespace MonopolyClone.Events;

[Serializable]
public class Transform
{
    public float[]? position { get; set; }
    public float[]? rotation { get; set; }
}

[Serializable]
public class CustomEventSchema
{
    public string mystring { get; } = "";
    public int[] diceLanded { get; set; } = new int[0];
    public Transform[] dicesStop { get; set; } = new Transform[0];
}


public static class OnDiceThrownEvent
{
    [SocketEvent("dice-thrown-start")]
    public static async Task Run(UserSocket user, ServerSocketHandler handler, CustomEventSchema payload)
    {
        if (payload.diceLanded.Length != 2 || payload.dicesStop.Length != 2)
            throw new InvalidPayloadException("Dice length must be 2");


        for (int i = 0; i < 2; i++)
        {
            Console.WriteLine("Dices Landed: " + payload.diceLanded[i]);
        }

        // await handler
        await handler.BroadcastMessage("dice-thrown-start", payload);

    }

}