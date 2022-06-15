using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;
using System.Buffers;
using WebSocketsHandler.Controllers.Events;

namespace WebSocketsHandler.Controllers;


// Idea is to create an event-based controller
// Allow for listening events on server, and registering events on client too.
// Allow for broadcasting messages to clients
// Define custom Keep-Alive pings
// Give each one a secretly generated-key, so that other clients can not impersonate others, and additionally can tell them apart from each other.


public class WebSocketController : ControllerBase
{
    
    private List<WebSocket> _socketInstances;
    //private List<SocketEvent>

    public WebSocketController(){
        _socketInstances = new List<WebSocket>();
    }

    [HttpGet("/ws")]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            Console.WriteLine("----------- accepted websocket --------");
            await HandleSocketRequest(webSocket);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }

    private static async Task HandleSocketRequest(WebSocket webSocket)
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
                        var x = SocketEventMessage.Deserialize(memory, request.Count);
                        //x.ToString();
                        Console.WriteLine(x.ToString());

                        break;
                    default:
                        break;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"{e.Message}\r\n{e.StackTrace}");
            }
        }

        Console.WriteLine("Websocket closed! -------------");
    }

    //private static async Task Echo(WebSocket webSocket)
    //{
    //    var buffer = new byte[1024 * 4];
    //    var receiveResult = await webSocket.ReceiveAsync(
    //        new ArraySegment<byte>(buffer), CancellationToken.None);

    //    while (!receiveResult.CloseStatus.HasValue)
    //    {
    //        await webSocket.SendAsync(
    //            new ArraySegment<byte>(buffer, 0, receiveResult.Count),
    //            receiveResult.MessageType,
    //            receiveResult.EndOfMessage,
    //            CancellationToken.None);

    //        receiveResult = await webSocket.ReceiveAsync(
    //            new ArraySegment<byte>(buffer), CancellationToken.None);
    //    }

    //    DebugLog("echoing but one");
    //    await webSocket.CloseAsync(
    //        receiveResult.CloseStatus.Value,
    //        receiveResult.CloseStatusDescription,
    //        CancellationToken.None);
    //}
}