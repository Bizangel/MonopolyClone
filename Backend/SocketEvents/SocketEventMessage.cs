using System.Text;
using System.Text.Json;
using System.Buffers;

namespace MonopolyClone.Events;

[Serializable]
public class SocketEventMessage
{
    private string _eventIdentifier = "";
    private string _payload = "";
    private string _authHeader = "";

    public string EventIdentifier { get => _eventIdentifier; set => _eventIdentifier = value ; }

    
    public string Payload { get => _payload; set => _payload = value; }

    public string AuthHeader { get => _authHeader; set => _authHeader = value; }

    public override string ToString()
    {
        return string.Format("Identifier {0} payload: {1} AuthHeader : {2}", EventIdentifier, Payload, AuthHeader);
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