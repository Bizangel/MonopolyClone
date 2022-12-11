
using System.Buffers;
using System.Net.WebSockets;
using System.Text;
using MonopolyClone.Events;
using MonopolyClone.Json;
using NLog;

namespace MonopolyClone.Sockets;

public class UserSocket
{
    // Add logging to class
    private static readonly Logger _logger;

    static UserSocket()
    {
        _logger = LogManager.GetCurrentClassLogger();
    }

    // Actual Attributes
    private readonly WebSocket _socket;
    public readonly string Username;
    public WebSocketState State { get => _socket.State; }

    public UserSocket(WebSocket socket, string username)
    {
        _socket = socket;
        Username = username;
    }

    public async Task Emit(string eventID, dynamic payload)
    {
        var message = new SocketEventMessage
        {
            EventIdentifier = eventID,
            Payload = MonopolySerializer.Serialize(payload),
        };

        var buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(SocketEventMessage.Serialize(message)));
        await _socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
    }

    public async Task<SocketEventMessage?> AwaitSocketEvent()
    {
        try
        {
            using IMemoryOwner<byte> memory = MemoryPool<byte>.Shared.Rent(1024 * 4);
            ValueWebSocketReceiveResult request = await _socket.ReceiveAsync(memory.Memory, CancellationToken.None);
            switch (request.MessageType)
            {
                case WebSocketMessageType.Text:
                    var eventmessage = SocketEventMessage.Deserialize(memory, request.Count);

                    return eventmessage;
                case WebSocketMessageType.Close:
                    return new SocketEventMessage() { EventIdentifier = "CloseEvent", Payload = "Closing" };
                default:
                    break;
            }
        }
        catch (Exception e)
        { // if failed just log error and return null
            _logger.Error($"Catched Exception on socket bytes \n ${e.Message} ${e.StackTrace}");
        }

        return null;
    }

}