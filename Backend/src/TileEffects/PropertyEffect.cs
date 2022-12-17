using MonopolyClone.Database.Models;
using Newtonsoft.Json;

namespace MonopolyClone.TileEffects;

/// <summary>
/// The effect of a property being a property.
/// </summary>
class PropertyEffect : TileEffect
{
    /// <summary>
    /// Effectively the ID of the property. Not to be confused with the TileID.
    /// An unique identifier for "Ownable Properties" from 0-27 (total 28 properties)
    /// These are in sequential order, first as their color, (according to convention defined below)
    /// Ex:
    /// 0, 1 maps to first 2 brown properties.
    /// 2, 3, 4 maps to the following lightblue properties (Despite there being a transport in between those two colors)
    /// 22, 23, 24, 25 maps to transport properties
    /// 26, 27 maps to services
    /// </summary>
    /// <value></value>
    [JsonRequired]
    public int propertyID { get; init; }

    /// <summary>
    /// Color group that this game tile belongs. Some game tiles don't necessarily have any associated group.
    /// Code is as follows
    /// 0 -> Brown
    /// 1 -> LightBlue
    /// 2 -> Pink
    /// 3 -> Orange
    /// 4 -> Red
    /// 5 -> Yellow
    /// 6 -> Green
    /// 7 -> Blue
    /// 8 -> Black (Transport)
    /// 9 -> Gray (Services Properties)
    /// </summary>
    /// <value></value>
    [JsonRequired]
    public int colorGroup { get; init; }

    /// <summary>
    /// The initial cost of the property
    /// </summary>
    [JsonRequired]
    public int cost { get; init; }

    [JsonRequired]
    public int[] rentCost { get; init; } = new int[0];

    // private void CalculateCost(Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles));

    public static Random rnd = new Random();

    /// <summary>
    /// Counts how many properties of the same color is owned by the given player
    /// </summary>
    /// <param name="category">The category to count from 0-9 </param>
    /// <param name="player">The player to count the owned categories of</param>
    /// <param name="gameTiles">The list of all the game tiles to check (ideally all 40)</param>
    /// <returns>How many of the same category properties are owned by the player, in the given gametiles </returns>
    private int countOwnedCategories(int category, Player player, List<GameTile> gameTiles)
    {
        var ownedSameColorCounter = 0;

        var ownedProperties = new HashSet<int>();
        foreach (var property in player.properties)
        {
            ownedProperties.Add(property.propertyID);
        }

        foreach (var tile in gameTiles)
        {
            if (tile.effect != null && tile.effect.GetType() == typeof(PropertyEffect))
            {
                var tileProperty = ((PropertyEffect)tile.effect);
                if (tileProperty.colorGroup == category && ownedProperties.Contains(tileProperty.propertyID))
                {
                    ownedSameColorCounter++;
                }
            }
        }

        return ownedSameColorCounter;
    }

    private Tuple<Player, PropertyDeed> FindOwnerAndDeed(List<Player> allPlayers)
    {
        // effectively find the owner
        Player? owner = null;
        PropertyDeed? deedLevel = null;
        foreach (var player in allPlayers)
        {
            foreach (var property in player.properties)
            {
                if (property.propertyID == propertyID)
                {
                    owner = player;
                    deedLevel = property;
                    break;
                }
            }
        }

        if (owner == null || deedLevel == null)
            throw new ArgumentException("Property execute effect was called on unowned property!");

        return Tuple.Create(owner, deedLevel);
    }

    /// <summary>
    /// Calculate the cost of the given player of landing on X property.
    /// </summary>
    /// <param name="landedPlayer">The player to calculate the cost for</param>
    /// <param name="allPlayers">All the other players</param>
    /// <param name="gameTiles">The list of all the game properties</param>
    /// <returns>How much that player has to pay for landing in that tile,
    /// can be 0 if it's the same owner</returns>
    private int CalculateCost(
      Player landedPlayer, List<Player> allPlayers, List<GameTile> gameTiles)
    {
        var ownerAndDeed = FindOwnerAndDeed(allPlayers);
        var owner = ownerAndDeed.Item1;
        var ownerDeeds = ownerAndDeed.Item2;

        // if it's the same person on their own property
        if (landedPlayer.name == owner.name)
            return 0;

        // Count how many of same color has
        var sameOwnedCount = countOwnedCategories(colorGroup, owner, gameTiles);

        // if services
        if (colorGroup == 9)
        {
            // find how many services
            var randomDiceRoll = (rnd.Next(1, 7) + rnd.Next(1, 7));
            return randomDiceRoll * rentCost[sameOwnedCount]; // multiplier
        }
        else if (colorGroup == 8)
        { // transport
            return rentCost[sameOwnedCount]; // return according to many properties
        }

        // normal property, color scaling and housing applies
        var totalPropertiesofSameColor = 3;
        if (colorGroup == 0 | colorGroup == 7)
        {
            totalPropertiesofSameColor = 2; // brown and blue only have two
        }

        // if unupgraded and has all properties then applies for x2 multiplier
        if (ownerDeeds.upgradeState == 0 && sameOwnedCount == totalPropertiesofSameColor)
        {
            return rentCost[0] * 2;
        }

        // if not, simply take as much as he has upgraded
        return rentCost[ownerDeeds.upgradeState];
    }

    public override string DescribeEffect(Player player, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        var ownerAndDeed = FindOwnerAndDeed(allPlayers);
        if (player.name == ownerAndDeed.Item1.name)
            return $"This is {player.name} property's";


        if (colorGroup == 9)
        { // if service
            var countOwned = countOwnedCategories(9, ownerAndDeed.Item1, gameTiles);
            return $"This is {ownerAndDeed.Item1.name} property's, {player.name} must pay diceRoll x{rentCost[ownerAndDeed.Item2.upgradeState]}";
        }

        int toPay = CalculateCost(player, allPlayers, gameTiles);

        return $"This is {ownerAndDeed.Item1.name} property's, {player.name} must pay {toPay}";
    }

    public override void ExecuteEffect(
  Player landedPlayer, List<Player> allPlayers, int currentTileIndex, List<GameTile> gameTiles)
    {
        var toDeduct = CalculateCost(landedPlayer, allPlayers, gameTiles);
        var ownerAndDeed = FindOwnerAndDeed(allPlayers);
        if (landedPlayer.name == ownerAndDeed.Item1.name)
            return;

        landedPlayer.money -= toDeduct;
        ownerAndDeed.Item1.money += toDeduct;
    }

}