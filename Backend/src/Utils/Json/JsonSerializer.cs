using System.Runtime.CompilerServices;
using Newtonsoft.Json;
namespace MonopolyClone.Json;

class JsonException : Newtonsoft.Json.JsonException { };


static class MonopolySerializer
{
    static private readonly JsonSerializerSettings _settings = new JsonSerializerSettings()
    {
        MissingMemberHandling = MissingMemberHandling.Error,
        NullValueHandling = NullValueHandling.Ignore,
    };

    public static string Serialize(object? value)
    {
        return JsonConvert.SerializeObject(value, _settings);
    }

    public static T? Deserialize<T>(string value)
    {
        return JsonConvert.DeserializeObject<T>(value, _settings);
    }

    public static object? Deserialize(string value, Type type)
    {
        return JsonConvert.DeserializeObject(value, type, _settings);
    }
}