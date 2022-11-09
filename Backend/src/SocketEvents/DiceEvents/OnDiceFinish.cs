using MonopolyClone.Game;
using MonopolyClone.Handler;
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
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, DiceFinishEvent payload)
    {
        if (!MonopolyGame.Instance.IsPlayerTurn(user.Username)) // not allowed to roll dice
            return;

        if (payload.diceLanded.Length != 2 || payload.dicesStop.Length != 2)
            throw new InvalidPayloadException("Dice length must be 2");

        Console.WriteLine("Received throw dice finish event from: " + user.Username);

        // await handler
        await serversocket.Broadcast("throw-dice-finish", payload, user.Username);

        await MonopolyHandler.Instance.BroadcastGameStateUpdate(serversocket);
    }

}