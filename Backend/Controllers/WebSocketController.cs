using System.Buffers;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;
using MonopolyClone.Events;
using NLog;

namespace MonopolyClone.Controllers;


// Idea is to create an event-based controller
// Allow for listening events on server, and registering events on client too.
// Allow for broadcasting messages to clients
// Define custom Keep-Alive pings
// Give each one a secretly generated-key, so that other clients can not impersonate others, and additionally can tell them apart from each other.


public class WebSocketController : ControllerBase
{
    private readonly Logger _logger;

    public WebSocketController()
    {
        _logger = LogManager.GetCurrentClassLogger();
    }

    [HttpGet("/ws")]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            _logger.Info("----------- Accepted Websocket Connection from IP:" + HttpContext.Connection.RemoteIpAddress);
            bool authenticated = await AuthenticateSocket(webSocket); // attempt authentication
            if (authenticated)
                await HandleSocketRequest(webSocket); // Then handle events information, etc
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }

    private async Task<bool> AuthenticateSocket(WebSocket webSocket)
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

                        string? user = AuthenticationController.GetUsernameFromSecret(eventmessage.AuthHeader);

                        if (user == null)
                        {
                            // close connection from unverified sockets
                            await webSocket.CloseAsync(WebSocketCloseStatus.PolicyViolation, "Unauthorized", CancellationToken.None);
                            _logger.Info("----------- Closed Websocket Connection due to unauthorized -----");
                            return false;
                        }

                        // keep connection open, and authorize. Create UserSocket object.
                        _logger.Info("----------- Websocket Connection Authenticated as  " + user + " ---------");
                        return true;
                    default: // close connection if doesn't send proper information.
                        await webSocket.CloseAsync(WebSocketCloseStatus.PolicyViolation, "Unauthorized", CancellationToken.None);
                        return false;
                }
            }
            catch (Exception e)
            {
                _logger.Error($"Catched Exception on socket bytes \n ${e.Message} ${e.StackTrace}");
                await webSocket.CloseAsync(WebSocketCloseStatus.PolicyViolation, "Unauthorized", CancellationToken.None);
                return false;
            }
        }

        await webSocket.CloseAsync(WebSocketCloseStatus.PolicyViolation, "Unauthorized", CancellationToken.None);
        return false;
    }

    private async Task HandleSocketRequest(WebSocket webSocket)
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

                        //SocketsEventHandler.HandleEvent(eventmessage.EventIdentifier, user, eventmessage.Payload);
                        break;
                    default:
                        break;
                }
            }
            catch (Exception e)
            {
                _logger.Error($"Catched Exception on socket bytes \n ${e.Message} ${e.StackTrace}");
            }
        }

        _logger.Info("----------- Closed Websocket Connection ---- ");
    }
}