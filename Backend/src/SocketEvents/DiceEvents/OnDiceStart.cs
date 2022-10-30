using MonopolyClone.Sockets;
namespace MonopolyClone.Events;


[Serializable]
public class DiceThrowValues
{
    public float[]? velocity { get; set; }
    public float[]? offset { get; set; }
}

[Serializable]
public class DiceStartEvent
{
    public DiceThrowValues[] throwValues { get; set; } = new DiceThrowValues[0];
}


public static class OnDiceFinishEvent
{
    [SocketEvent("throw-dice-start")]
    public static async Task Run(UserSocket user, ServerSocketHandler handler, DiceStartEvent payload)
    {
        if (payload.throwValues.Length != 2)
            throw new InvalidPayloadException("Dice length must be 2");

        // TODO: Verify that dice is actually from proper player in turn
        Console.WriteLine("Received throw dice start event from: " + user.Username);

        // await handler
        await handler.BroadcastMessage("throw-dice-start", payload, user.Username);

    }

}