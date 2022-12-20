
using MonopolyClone.Database.Models;

namespace MonopolyClone.Game;

[Serializable]
public class TradeOffer
{
    public int money { get; set; } = 0;

    public List<PropertyDeed> properties = new List<PropertyDeed>(); // property IDs specified
}

[Serializable]
public class TradeState
{
    public string tradeInitiator { get; set; } = "";
    public string tradeTarget { get; set; } = "";

    public bool initiatorConsent { get; set; }

    public bool targetConsent { get; set; }

    public TradeOffer initiatorOffer { get; set; } = new TradeOffer();
    public TradeOffer targetOffer { get; set; } = new TradeOffer();
}

enum TradePartaker
{
    Initiator,
    Target,
};

public class TradeHandler
{
    private Player? _initiator = null;
    private Player? _target = null;
    private TradeState? _currentTrade = null;

    /// <summary>
    /// Verifies if the trade offer is valid.
    /// i.e. if the player actually has the money and properties to offer such resources.s
    /// </summary>
    /// <param name="player">The player to check against</param>
    /// <param name="offer">The offer to verify</param>
    /// <returns>Whether the offer is valid or not</returns>
    private bool VerifyOffer(Player player, TradeOffer offer)
    {
        var ownedProperties = new HashSet<int>();
        player.properties.ForEach((e) =>
        {
            ownedProperties.Add(e.propertyID);
        });

        // check that all properties are indeed in owned properties
        foreach (var property in offer.properties)
        {
            if (!ownedProperties.Contains(property.propertyID))
                return false;
        }

        // check that player has the money
        if (offer.money > player.money)
            return false;

        return true;
    }

    /// <summary>
    /// Transfer the property with the given ID from the source player to the target player.
    /// Raises an exception if the property with the given ID is not owned by source player
    /// </summary>
    /// <param name="source">The player to transfer from</param>
    /// <param name="target">The player to receive the propertys</param>
    /// <param name="propertyID">The property to transfer</param>
    private void TransferProperty(Player source, Player target, int propertyID)
    {
        //This might not be exactly efficient, due to checking the player properties.
        //However it makes it pretty error proof
        var propLocation = source.properties.FindIndex((e) => e.propertyID == propertyID);
        if (propLocation == -1)
            throw new ArgumentException("Tried to transfer property from player that doesn't own said property");

        var property = source.properties[propLocation];
        // remove it from source
        source.properties.RemoveAt(propLocation);
        // add it to other
        target.properties.Add(property);
    }

    /// <summary>
    /// Actually performs the trade, as per the currently specified TradeOffer.
    /// This is intended to be called AFTER the consent of both players have been validated.
    /// </summary>
    private void PerformTrade()
    {
        if ((_currentTrade == null) || (_initiator == null) || (_target == null))
            throw new ArgumentException("Performing trade with no active trade, null arguments!");

        // send money one way
        _target.money += _currentTrade.initiatorOffer.money;
        _initiator.money -= _currentTrade.initiatorOffer.money;

        // and the other
        _initiator.money += _currentTrade.targetOffer.money;
        _target.money -= _currentTrade.targetOffer.money;

        // Send properties from initiator to target
        foreach (var property in _currentTrade.initiatorOffer.properties)
        {
            TransferProperty(_initiator, _target, property.propertyID);
        }
        // Send properties from target to initiator
        foreach (var property in _currentTrade.targetOffer.properties)
        {
            TransferProperty(_target, _initiator, property.propertyID);
        }

        // trade has effectively finish. CLear it up.
        _currentTrade = null;
        _initiator = null;
        _target = null;
    }

    private TradePartaker? findTradePlayerWithName(string name)
    {
        if (_initiator != null && _initiator.name == name)
            return TradePartaker.Initiator;

        if (_target != null && _target.name == name)
            return TradePartaker.Target;

        return null;
    }
    public void StartNewTrade(Player initiator, Player target)
    {
        if (isActiveTrade())
            return;

        if (initiator.name == target.name)
            throw new ArgumentException("Tried to trade with itself!");

        _initiator = initiator;
        _target = target;
        _currentTrade = new TradeState()
        {
            tradeInitiator = initiator.name,
            tradeTarget = target.name,
            initiatorConsent = false,
            targetConsent = false,
        };
    }

    /// <summary>
    /// Cancels the current trade.
    /// Doesn't do anything if there's no current active trade.
    /// </summary>
    public void CancelCurrentTrade()
    {
        if (!isActiveTrade())
            return;

        _initiator = null;
        _target = null;
        _currentTrade = null;
    }

    /// <summary>
    /// Determines if there's currently an active trade.
    /// Intended to be called before performing trade related actions.
    ///
    /// Can not initiate a new trade if a previous one already exists.
    /// </summary>
    /// <returns></returns>
    public bool isActiveTrade()
    {
        return _currentTrade != null;
    }

    /// <summary>
    /// Returns the current trade state. Null if there's no trade currently.
    /// </summary>
    /// <returns>The current trade state.</returns>
    public TradeState? GetCurrentTrade()
    {
        return _currentTrade;
    }

    /// <summary>
    /// Updates the offer of the given player
    /// </summary>
    /// <param name="playername">The player of the offer to update, if the player is not in the trade, ignores this call</param>
    /// <param name="newOffer">The new offer to set</param>
    public void SetOffer(string playername, TradeOffer newOffer)
    {
        if (_currentTrade == null || _initiator == null || _target == null)
            return;

        var player = findTradePlayerWithName(playername);
        if (player == TradePartaker.Initiator && VerifyOffer(_initiator, newOffer))
            _currentTrade.initiatorOffer = newOffer;
        else if (player == TradePartaker.Target && VerifyOffer(_target, newOffer))
            _currentTrade.targetOffer = newOffer;

        if (player != null)
        {  // there was a change, so consent must be reapproved
            _currentTrade.initiatorConsent = false;
            _currentTrade.targetConsent = false;
        }

    }

    /// <summary>
    /// Sets the consent of the given player of the trade
    ///
    /// If player is not present in trade, call is ignored
    /// </summary>
    /// <param name="playername">The player to set the consent for</param>
    /// <param name="consent">New consent value, true for accepting the trade</param>
    public void SetConsent(string playername, bool consent)
    {
        if (_currentTrade == null)
            return;

        var player = findTradePlayerWithName(playername);
        if (player == TradePartaker.Initiator)
            _currentTrade.initiatorConsent = consent;
        else if (player == TradePartaker.Target)
            _currentTrade.targetConsent = consent;

        if (_currentTrade.targetConsent && _currentTrade.initiatorConsent)
        {
            // finish and perform trade
            PerformTrade();
        };
    }

    public bool isTradeRecipient(string player)
    {
        return findTradePlayerWithName(player) != null;
    }
};