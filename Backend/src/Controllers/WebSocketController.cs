using System.Buffers;
using System.Net.WebSockets;
using System.Threading;
using Microsoft.AspNetCore.Mvc;
using MonopolyClone.Auth;
using MonopolyClone.Auth.CryptTools;
using MonopolyClone.Events;
// using Newtonsoft.Json;
using MonopolyClone.Json;
using MonopolyClone.Sockets;
using NLog;

namespace MonopolyClone.Controllers;


//TODO: Implement Keep-Alive pings for faster DC events.

// Remember there isn't a single singleton controller!
public class WebSocketController : ControllerBase
{
    private static ServerSocketHandler _socketHandler;
    private static ReaderWriterLockSlim _synclock;
    private readonly Logger _logger;
    private readonly AesEncryptor _aesEncryptor;

    static WebSocketController()
    {
        _synclock = new ReaderWriterLockSlim();
        _socketHandler = new ServerSocketHandler();
    }

    public WebSocketController()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _aesEncryptor = new AesEncryptor();
    }

    [HttpGet("/ws")]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            // Verify Cookie credentials, and that they're valid.

            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            string? authCookie = Request.Cookies["Auth"];
            if (authCookie == null)
            {
                await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.ProtocolError);
                return;
            }

            CookieHolder? holder = null;
            try
            {
                holder = JsonSerializer.Deserialize<CookieHolder>(_aesEncryptor.Decrypt(authCookie));
            }
            catch (JsonException)
            {
                await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.ProtocolError);
                return;
            }


            if (holder == null)
            {
                await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.ProtocolError);
                return;
            }
            // holder.AuthenticatedUser = "nice";
            if (!VerifyCookieTime(holder))
            {
                await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.ProtocolError);
                return;
            }

            var alreadyExists = false;

            using (_synclock.Read())
            {
                // Disallow duplicate websocket connections!
                if (_socketHandler.AlreadyConnected(holder.AuthenticatedUser))
                    alreadyExists = true;
            }

            if (alreadyExists)
            {
                await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.ProtocolError);
                return;
            }




            _logger.Info("----------- Accepted Websocket Connection from IP:" + HttpContext.Connection.RemoteIpAddress);
            var userSocket = new UserSocket(webSocket, holder.AuthenticatedUser);
            using (_synclock.Write())
            {
                _socketHandler.RegisterSocket(userSocket);
            }

            // notify new connection
            await SocketsEventHandler.NotifyNewConnection(userSocket, _socketHandler);

            await HandleSocketRequest(userSocket); // Then handle events information, etc
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }

    private static bool VerifyCookieTime(CookieHolder holder)
    {
        return holder.ExpiryTimestamp > ((DateTimeOffset)DateTime.Now).ToUnixTimeSeconds();
    }

    private async Task HandleSocketRequest(UserSocket socket)
    {
        using IMemoryOwner<byte> memory = MemoryPool<byte>.Shared.Rent(1024 * 4);
        bool requestedClose = false;
        while (socket.State == WebSocketState.Open)
        {
            SocketEventMessage? newEvent = await socket.AwaitSocketEvent();
            if (newEvent == null)
            {
                _logger.Debug("Received invalid socket event!");
                continue;
            }

            if (newEvent.EventIdentifier == "CloseEvent")
            {
                requestedClose = true;
                break;
            }

            // handle event
            SocketsEventHandler.HandleEvent(newEvent.EventIdentifier, socket, newEvent.Payload, _socketHandler);
        }

        if (socket.State == WebSocketState.Aborted)
            _logger.Info($"----------- Lost Connection of user: {socket.Username} ---- ");

        if (requestedClose)
            _logger.Info($"----------- User {socket.Username} closed connection!");
        else
            _logger.Info($"----------- Closed Authenticated Websocket Connection of user: {socket.Username} ---- ");
        SocketsEventHandler.NotifyOnConnectionLost(socket.Username, _socketHandler);
        _socketHandler.UnregisterSocket(socket);
    }

    private async Task SecureCloseWebsocket(WebSocket webSocket, string Reason, WebSocketCloseStatus status = WebSocketCloseStatus.NormalClosure)
    {
        if (webSocket.State == WebSocketState.Aborted)
        {
            _logger.Info("----------- Lost Websocket Connection, Aborted: ");
            return;
        }

        if (webSocket.State == WebSocketState.Open)
        {
            _logger.Info("----------- Closed Websocket Connection, Reason: " + Reason);
            await webSocket.CloseAsync(status, Reason, CancellationToken.None);
        }

        if (webSocket.State == WebSocketState.CloseReceived)
        {
            _logger.Info("----------- Closed Websocket connection from user ---");
        }

        // if (webSocket.State == WebSocketState.Closed)
        // {
        //     _logger.Warn("Attempted to close already closed websocket connection!");
        // }
    }
}