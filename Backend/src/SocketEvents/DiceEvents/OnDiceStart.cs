using MonopolyClone.Game;
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
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, DiceStartEvent payload)
    {
        if (!MonopolyGame.Instance.IsPlayerTurn(user.Username)) // not allowed to roll dice
            return;

        if (payload.throwValues.Length != 2)
            throw new InvalidPayloadException("Dice length must be 2");

        Console.WriteLine("Received throw dice start event from: " + user.Username);

        // await handler
        await serversocket.BroadcastMessage("throw-dice-start", payload, user.Username);

    }

}