
using MonopolyClone.TileEffects;

using Newtonsoft.Json;

namespace MonopolyClone.Database.Models;

public class CommunityChanceCard
{
    [JsonRequired]
    public TileEffect effect { get; init; } = new RawSumEffect(); // default that doesn't do anything, but still needs to be specified in json

    [JsonRequired]
    public string description { get; init; } = "";
}

public class GameBoardCards
{
    public List<CommunityChanceCard> communityChestCards = new List<CommunityChanceCard>();
    public List<CommunityChanceCard> chanceCards = new List<CommunityChanceCard>();
}