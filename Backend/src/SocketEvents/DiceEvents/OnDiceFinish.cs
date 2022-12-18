using MonopolyClone.Common;
using MonopolyClone.Game;
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
        // not allowed to roll dice
        if (!MonopolyGame.Instance.IsPlayerTurn(user.Username) || MonopolyGame.Instance.CurrentTurnPhase != TurnPhase.Standby
        || MonopolyGame.Instance.IsActiveTrade()) // disallow rolling dices if there's a trade active
            return;

        if (payload.diceLanded.Length != 2 || payload.dicesStop.Length != 2)
            throw new InvalidPayloadException("Dice length must be 2");

        // await handler
        await serversocket.Broadcast("throw-dice-finish", payload, user.Username);

        // perform move
        MonopolyGame.Instance.MovePlayerPosition(user.Username, payload.diceLanded);

        await MonopolyGame.Instance.BroadcastStateUpdate(serversocket);
    }

}