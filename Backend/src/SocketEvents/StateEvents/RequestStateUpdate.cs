using MonopolyClone.Game;
using MonopolyClone.Sockets;
using NLog;
namespace MonopolyClone.Events;

public static class OnStateUpdateRequested
{
    [SocketEvent("request-state-update")]
    public static async Task Run(UserSocket user, ServerSocketHandler serversocket, string payload)
    {
        var _logger = LogManager.GetCurrentClassLogger();
        _logger.Debug($"player {user.Username} requested state update.");

        await MonopolyGame.Instance.EmitStateUpdate(user, serversocket);
    }

}