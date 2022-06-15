using System.Text;
using System.Text.Json;
using System.Buffers;

namespace WebSocketsHandler.Controllers.Events;

[Serializable]
public class SocketEventMessage
{
    private int _eventIdentifier = -1;
    private string _payload = "";
    private bool _validEvent = false;
    private string _authHeader = "";

    public int EventIdentifier { get => _eventIdentifier; set => _eventIdentifier = value ; }

    
    public string Payload { get => _payload; set => _payload = value; }

    public bool IsValidEvent { get => _validEvent; set => _validEvent = value; }

    public string AuthHeader { get => _authHeader; set => _authHeader = value; }

    public override string ToString()
    {
        return string.Format("Identifier {0} payload: {1} Is Valid? : {2} AuthHeader : {3}", EventIdentifier, Payload, IsValidEvent, AuthHeader);
    }

    public static SocketEventMessage Deserialize(IMemoryOwner<byte> membytes, int byteCount)
    {
        try
        {
            string msg = Encoding.UTF8.GetString(membytes.Memory.Slice(0, byteCount).Span);
            return JsonSerializer.Deserialize<SocketEventMessage>(msg)!;
        }
        catch (Exception)
        {
            return new SocketEventMessage();
        }
    }
}