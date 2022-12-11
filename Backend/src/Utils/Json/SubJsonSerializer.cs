using System.Runtime;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MonopolyClone.Json;

public class SubJsonSerializer<DiscriminatorType> : JsonConverter where DiscriminatorType : struct
{
    private readonly string _typeDiscriminator;
    private readonly Dictionary<DiscriminatorType, Type> _subtype_mapping;
    private readonly Type _baseType;

    public SubJsonSerializer(Type BaseType, string typeDiscriminator, DiscriminatorType[] keys, Type[] values)
    {
        _baseType = BaseType;
        _typeDiscriminator = typeDiscriminator;
        _subtype_mapping = new Dictionary<DiscriminatorType, Type>();

        if (keys.Length != values.Length)
        {
            throw new ArgumentException("Invalid SubJsonSerializer Discriminator Mapping, See Example");
        }
        for (int i = 0; i < keys.Length; i++)
            _subtype_mapping.Add(keys[i], values[i]);
    }

    public override bool CanConvert(Type objectType)
    {
        return _baseType.IsAssignableFrom(objectType);
    }

    public override object ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
    {
        JObject? item = null;
        try
        {
            item = JObject.Load(reader);
        }
        catch (JsonReaderException)
        {
            throw new JsonReaderException("this is my exception cool huh");
        }

        object? specifier = item[_typeDiscriminator];
        if (specifier == null)
        {
            throw new JsonSerializationException("Expected discriminator not found while parsing SubTypeJson.");
        }

        DiscriminatorType specs = new DiscriminatorType();
        try
        {
            specs = (DiscriminatorType)Convert.ChangeType(specifier, typeof(DiscriminatorType));
        }
        catch
        {
            throw new JsonSerializationException($"Couldn't parse specifier into desired type {typeof(DiscriminatorType)}");
        }

        Type? subtype = _subtype_mapping.GetValueOrDefault(specs);
        if (subtype == null)
        {
            throw new JsonSerializationException("Discriminator with missing mapping specified!");
        }

        var varobj = Activator.CreateInstance(subtype);

        if (varobj == null)
        {
            throw new JsonSerializationException("Could not initialize json!");
        }

        serializer.Populate(item.CreateReader(), varobj);
        return varobj;
    }

    public override bool CanWrite => false;

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        throw new NotImplementedException();
    }
}