using MonopolyClone.Sockets;
namespace MonopolyClone.Events;

[Serializable]
public class Transform
{
    public float[]? position { get; set; }
    public float[]? rotation { get; set; }
}

[Serializable]
public class DiceFinishEvent
{
    public int[] diceLanded { get; set; } = new int[0];
    public Transform[] dicesStop { get; set; } = new Transform[0];
}


public static class OnDiceThrownEvent
{
    [SocketEvent("throw-dice-finish")]
    public static async Task Run(UserSocket user, ServerSocketHandler handler, DiceFinishEvent payload)
    {
        if (payload.diceLanded.Length != 2 || payload.dicesStop.Length != 2)
            throw new InvalidPayloadException("Dice length must be 2");

        // TODO: Verify that dice is actually from proper player in turn

        Console.WriteLine("Received throw dice finish event from: " + user.Username);
        // for (int i = 0; i < 2; i++)
        // {
        //     Console.WriteLine("Dices Landed: " + payload.diceLanded[i]);
        // }

        // await handler
        await handler.BroadcastMessage("throw-dice-finish", payload, user.Username);

    }

}