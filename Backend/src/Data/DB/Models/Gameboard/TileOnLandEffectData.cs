
using System.Text.Json;
using System.Text.Json.Serialization;

using MonopolyClone.Common;

namespace MonopolyClone.Database.Models;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "effectID")]
[JsonDerivedType(typeof(PropertyPayOnLandEffectData), (int)OnLandEffect.PropertyPay)]
[JsonDerivedType(typeof(DeductAmountLandEffect), (int)OnLandEffect.DeductAmount)]
public interface TileOnLandEffectData
{
    void ExecuteEffect();
};

public class PropertyPayOnLandEffectData : TileOnLandEffectData
{
    required public List<int> houseCost { get; set; }
    public void ExecuteEffect()
    {

    }
};

class DeductAmountLandEffect : TileOnLandEffectData
{
    required public int deductAmount { get; set; }
    public void ExecuteEffect()
    {
    }
};