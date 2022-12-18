using System.Buffers;
using System.Text;
using MonopolyClone.Json;

namespace MonopolyClone.Events;

[Serializable]
public class SocketEventMessage
{
    private string _eventIdentifier = "";
    private string _payload = "";

    public string EventIdentifier { get => _eventIdentifier; set => _eventIdentifier = value; }
    public string Payload { get => _payload; set => _payload = value; }

    public override string ToString()
    {
        return string.Format("Identifier {0} payload: {1} AuthHeader : {2}", EventIdentifier, Payload);
    }

    /// <summary>
    /// Deserializes a SocketEventMessage from a json string as bytes.
    /// </summary>
    /// <param name="membytes">The bytes to deserialize</param>
    /// <param name="byteCount">The bytecount</param>
    /// <returns>The MessageSocketEvent should deserialization be successful, returns null otherwise</returns>
    public static SocketEventMessage? Deserialize(IMemoryOwner<byte> membytes, int byteCount)
    {
        try
        {
            string msg = Encoding.UTF8.GetString(membytes.Memory.Slice(0, byteCount).Span);
            return MonopolySerializer.Deserialize<SocketEventMessage>(msg);
        }
        catch (Newtonsoft.Json.JsonException)
        {
            return null;
        }
    }

    public static string Serialize(SocketEventMessage message)
    {
        return MonopolySerializer.Serialize(message);
    }

}