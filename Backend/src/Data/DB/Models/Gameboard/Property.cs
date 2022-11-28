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
    public int groupID { get; set; } = 0;

    public int housesEffect { get; set; } = 0;
};
