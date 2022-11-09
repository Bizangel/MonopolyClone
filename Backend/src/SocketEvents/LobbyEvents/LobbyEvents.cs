using MonopolyClone.Common;
using MonopolyClone.Game;
using MonopolyClone.Lobby;
using MonopolyClone.Sockets;
using NLog;

namespace MonopolyClone.Events;

public static class LobbyEventHandler
{
    [SocketEvent("lobby-join")]
    [SocketEventLabel(EventLabel.Lobby)]
    public static async Task OnLobbyJoin(UserSocket user, ServerSocketHandler handler, string payload)
    {
        var _logger = LogManager.GetCurrentClassLogger();

        if (LobbyHandler.Instance.GetLobbyPass() != payload)
        {
            await user.Emit("lobby-join-fail", "Invalid Lobby password!");
            return;
        };

        if (MonopolyGame.Instance.ListeningEventLabel != EventLabel.Lobby)
        {
            await user.Emit("lobby-join-fail", "There's a game already in progress!");
            return;
        }

        LobbyHandler.Instance.OnLobbyJoin(user.Username);

        await handler.BroadcastMessage("lobby-update", LobbyHandler.Instance.GetLobbyUpdate());
    }

    [OnSocketConnectionLost]
    public static async Task OnLobbyLeave(string dc_user, ServerSocketHandler handler)
    {
        var _logger = LogManager.GetCurrentClassLogger();
        _logger.Debug($"User: {dc_user} disconnected!");

        LobbyHandler.Instance.OnLobbyLeave(dc_user);

        await handler.BroadcastMessage("lobby-update", LobbyHandler.Instance.GetLobbyUpdate());
    }

    [OnSocketConnect]
    public static async Task LobbyOnConnectLobbyUpdate(UserSocket user, ServerSocketHandler handler)
    {
        if (MonopolyGame.Instance.ListeningEventLabel != EventLabel.Lobby)
            return;

        Console.WriteLine($"User connected: {user.Username}, updating him with latest lobby state");
        await user.Emit("lobby-update", LobbyHandler.Instance.GetLobbyUpdate());
    }

    [SocketEvent("lobby-lock")]
    [SocketEventLabel(EventLabel.Lobby)]
    public static async Task LobbyOnUserLock(UserSocket user, ServerSocketHandler handler, Character payload)
    {
        var success = LobbyHandler.Instance.AttemptSelect(user.Username, payload);

        if (!success)
            return; // don't emit update

        await handler.BroadcastMessage("lobby-update", LobbyHandler.Instance.GetLobbyUpdate());
    }

    [SocketEvent("lobby-unlock")]
    [SocketEventLabel(EventLabel.Lobby)]
    public static async Task LobbyOnUserUnlock(UserSocket user, ServerSocketHandler handler, string payload)
    {
        var success = LobbyHandler.Instance.AttemptDeselect(user.Username);

        if (!success)
            return; // don't emit update

        await handler.BroadcastMessage("lobby-update", LobbyHandler.Instance.GetLobbyUpdate());
    }
}