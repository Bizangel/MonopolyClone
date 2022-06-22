using System.Buffers;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;
using MonopolyClone.Events;
using MonopolyClone.Sockets;
using NLog;
namespace MonopolyClone.Controllers;

// Idea is to create an event-based controller
// DONE: Allow for listening events on server, 
// and registering events on client too.
// Allow for broadcasting messages to clients
// Define custom Keep-Alive pings  <-- Optional, but Timeouts are REALLY long. 
// Connection can get aborted after 1-3 minutes, or just as early as we don't receive a reply by any in-game mechanic.
// DONE: Give each one a secretly generated-key, so that other clients can not impersonate others, and additionally can tell them apart from each other.


public class WebSocketController : ControllerBase
{
    private readonly ServerSocketHandler _socketHandler;
    private readonly Logger _logger;

    public WebSocketController()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _socketHandler = new ServerSocketHandler();
    }

    [HttpGet("/ws")]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            _logger.Debug("Received request cookies in websocket request!:");
            foreach (var x in Request.Cookies)
            {
                _logger.Debug(x.Key + "->" + x.Value);
            }

            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            _logger.Info("----------- Accepted Websocket Connection from IP:" + HttpContext.Connection.RemoteIpAddress);
            var userSocket = await AuthenticateSocket(webSocket); // attempt authentication
            if (userSocket != null) // if authenticated
                await HandleSocketRequest(userSocket); // Then handle events information, etc
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }

    private async Task<UserSocket?> AuthenticateSocket(WebSocket webSocket)
    {
        using IMemoryOwner<byte> memory = MemoryPool<byte>.Shared.Rent(1024 * 4);

        while (webSocket.State == WebSocketState.Open)
        {
            try
            {
                ValueWebSocketReceiveResult request = await webSocket.ReceiveAsync(memory.Memory, CancellationToken.None);
                switch (request.MessageType)
                {
                    case WebSocketMessageType.Text:
                        var eventmessage = SocketEventMessage.Deserialize(memory, request.Count);

                        if (eventmessage == null)
                        {
                            // close connection from unverified sockets
                            await SecureCloseWebsocket(webSocket, "Invalid AuthProtocol", WebSocketCloseStatus.PolicyViolation);
                            return null;
                        }

                        string? user = AuthenticationController.GetUsernameFromSecret(eventmessage.AuthHeader);

                        if (user == null)
                        {
                            // close connection from unverified sockets
                            await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.PolicyViolation);
                            return null;
                        }

                        // keep connection open, and authorize. Create UserSocket object.
                        UserSocket userSocket = new UserSocket(webSocket, user);
                        _socketHandler.RegisterSocket(userSocket);

                        await userSocket.SendEvent("authEvent", "Success");

                        _logger.Info($"----------- Authenticated websocket as User: {user} -----");
                        return userSocket;
                    default: // close connection if doesn't send proper information.
                        await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.PolicyViolation);
                        return null;
                }
            }
            catch (Exception e)
            {
                _logger.Error($"Catched Exception on socket bytes \n ${e.Message} ${e.StackTrace}");
                await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.PolicyViolation);
                return null;
            }
        }

        await SecureCloseWebsocket(webSocket, "Unauthorized", WebSocketCloseStatus.PolicyViolation);
        return null;
    }

    private async Task HandleSocketRequest(UserSocket socket)
    {
        using IMemoryOwner<byte> memory = MemoryPool<byte>.Shared.Rent(1024 * 4);

        while (socket.State == WebSocketState.Open)
        {
            SocketEventMessage? newEvent = await socket.AwaitSocketEvent();
            if (newEvent == null)
            {
                _logger.Debug("Received invalid socket event!");
                continue;
            }

            // handle event
            SocketsEventHandler.HandleEvent(newEvent.EventIdentifier, socket, newEvent.Payload, _socketHandler);
        }

        if (socket.State == WebSocketState.Aborted)
            _logger.Info($"----------- Lost Connection of user: {socket.Username} ---- ");

        _logger.Info($"----------- Closed Authenticated Websocket Connection of user: {socket.Username} ---- ");
        SocketsEventHandler.NotifyOnConnectionLost(socket.Username);
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