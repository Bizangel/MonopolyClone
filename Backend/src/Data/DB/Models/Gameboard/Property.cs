namespace MonopolyClone.Database.Models;

public class Property
{
    /// <summary>
    /// Effectively the group of the property.
    /// This determines with which properties to associate others.
    /// This is effectively "the color" of a property.
    ///
    /// Some groups ID may be reserved to specify different than usual traits. (Transport properties etc)
    /// </summary>
    /// <value></value>
    required public int groupID { get; set; }

    /// <summary>
    /// This property define the effect of the property as in the amount of houses available.
    /// </summary>
    /// <value></value>
    required public int housesEffect { get; set; }
};
