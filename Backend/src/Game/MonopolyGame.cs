using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Events;
using MonopolyClone.InterfaceState;

using NLog;

namespace MonopolyClone.Game;

public class MonopolyGame
{
    /// <summary>
    /// Defines which events will be listened to and which will be ignored.
    /// </summary>
    private EventLabel _listeningEventLabel = EventLabel.Default;
    private TradeHandler _tradeHandler;
    private Auction? _runningAuction = null;

    public EventLabel ListeningEventLabel => _listeningEventLabel;

    private GameBoard _board;
    private static readonly MonopolyGame _instance = new MonopolyGame();
    public static MonopolyGame Instance => _instance;

    private bool _hasUpgradedPropertyThisTurn = false;
    private MonopolyGame()
    {
        _tradeHandler = new TradeHandler();
        _logger = LogManager.GetCurrentClassLogger();
        _board = new GameBoard();
    }

    private readonly Logger _logger;

    // defaults
    private GameState _gameState = new GameState()
    {
        currentTurn = 0,
        players = new List<Player>(),
        unpurchasedProperties = new List<PropertyDeed>(),
        uiState = new UIState(),
    };

    private int _jailRollsThisTurn = 0;
    private int _doublesCounter = 0;

    private TurnPhase _currentTurnPhase = TurnPhase.Standby;
    private RollResult? _roll_result = null;
    public TurnPhase CurrentTurnPhase => _currentTurnPhase;
    public GameBoard GameBoard => _board;

    /// <summary>
    /// Searches for the player with the specified name. Returns null if it doesn't exist.
    /// </summary>
    /// <param name="playername">The player name to search for</param>
    /// <returns>The requested Player or Null if it is not found</returns>
    private Player? FindPlayer(string playername)
    {
        foreach (var player in _gameState.players)
        {
            if (player.name == playername)
                return player;
        }
        return null;
    }


    private int HouseCost(int tileID)
    {
        if (tileID < 0)
            throw new NotImplementedException();

        if (tileID < 10)
        {
            return 50;
        }
        else if (tileID < 20)
        {
            return 100;
        }
        else if (tileID < 30)
        {
            return 150;
        }
        else if (tileID < 40)
        {
            return 200;
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    /// <summary>
    /// Determines how much money is a player's properties worth
    /// </summary>
    /// <param name="player">The player to determine the properties</param>
    /// <returns>How much the player is worth</returns>
    private int CalculatePlayerPropertyWorth(Player player)
    {
        int worth = 0;

        var propertyIDtoTileID = new Dictionary<int, int>();
        var propertyIDtoCost = new Dictionary<int, int>();
        foreach (var tile in _board.Tiles)
        {
            if (tile.effect != null && tile.effect.effectID == 0)
            {
                var property = (MonopolyClone.TileEffects.PropertyEffect)tile.effect;
                propertyIDtoTileID.Add(property.propertyID, tile.tileID);
                propertyIDtoCost.Add(property.propertyID, property.cost);
            }
        }

        player.properties.ForEach(property =>
        {
            // he has the property
            if (property.upgradeState == -1)
            {
                worth += propertyIDtoCost[property.propertyID] / 2; // half price only due to mortgage
            }
            else
            {
                worth += propertyIDtoCost[property.propertyID]; // full property price
            }

            // add the upgrade levels
            if (property.upgradeState > 0)
            {
                worth += property.upgradeState * HouseCost(propertyIDtoTileID[property.propertyID]);
            }
        });

        return worth;
    }

    // <summary>
    /// Determines how much a player can mortage and sell
    /// </summary>
    /// <param name="player">The player to determine the mortgage values</param>
    /// <returns>How much can he mortgage</returns>
    private int HowMuchCanMortgage(Player player)
    {
        int worth = 0;

        var propertyIDtoTileID = new Dictionary<int, int>();
        var propertyIDtoCost = new Dictionary<int, int>();
        foreach (var tile in _board.Tiles)
        {
            if (tile.effect != null && tile.effect.effectID == 0)
            {
                var property = (MonopolyClone.TileEffects.PropertyEffect)tile.effect;
                propertyIDtoTileID.Add(property.propertyID, tile.tileID);
                propertyIDtoCost.Add(property.propertyID, property.cost);
            }
        }

        player.properties.ForEach(property =>
        {
            // he has the property
            if (property.upgradeState == -1) // cannot remortgage, worthless
                return;

            worth += propertyIDtoCost[property.propertyID] / 2; // mortgage value

            // add the upgrade levels
            if (property.upgradeState > 0)
            {
                worth += (property.upgradeState * HouseCost(propertyIDtoTileID[property.propertyID])) / 2;
            }
        });

        return worth;
    }


    /// <summary>
    /// Finishes the monopoly Game.
    /// /// </summary>
    private void FinishGame()
    {
        // doesn't listen to default game event, basically freeze state.
        _listeningEventLabel = EventLabel.GameDone;

        // null these for display purposes
        _roll_result = null;
        _currentTurnPhase = TurnPhase.Standby;
        _runningAuction = null; // delete auction just in case

        // A reboot is expected here.
        // When sockets are connected, because it is now gameDone, they will be auto given the game finish status.
        // once server is shut down the json will be deleted and a fresh game can be played.
    }

    /// <summary>
    /// Performs necessary game checks for several things.
    /// Mainly to see players money going below negative and then ending the game properly.
    ///
    /// This function will be called multiple times to perform verifications.
    /// Do make it relatively stateless and do not rely on the fact on how many times it will be executed,
    /// as it can and WILL be executed multiple times in a same turn.
    /// </summary>
    public bool PerformGameChecks()
    {

        foreach (var player in _gameState.players)
        {
            if (player.money < 0)
            {
                if ((player.money + HowMuchCanMortgage(player)) < 0)
                {
                    // rip
                    FinishGame();
                    return false;
                }
                else
                {
                    // await till this function is called again, but now player has more than 0 money
                    // set to mortgage state
                    _currentTurnPhase = TurnPhase.Mortgageby;
                    return false;
                }
            }
        }

        if (_currentTurnPhase == TurnPhase.Mortgageby)
        {
            // no longer in mortgage
            _currentTurnPhase = TurnPhase.Choiceby;
            AttemptFinishTurn();
            return true;
        }

        return true;
    }

    /// <summary>
    /// Sets the game into Lobby state.
    /// Makes it listen for lobby connections, and basic game events will be ignored.
    /// </summary>
    public void GoToLobby()
    {
        _listeningEventLabel = EventLabel.Lobby;
    }

    // Someone needs to call this to start a game.
    // Ideally an admin or something.
    // To start a game, we need to know, who's gonna play (Names)
    // and the characters of those players (car, thimble, etc)
    // and the order of the players (this matters!)
    public void InitializeGame(MonopolyClone.Lobby.LobbyState state)
    {
        state.players.Shuffle(); // shuffle players
        _listeningEventLabel = EventLabel.Default; // Make it listen to default events instead of lobby ones.
        _currentTurnPhase = TurnPhase.Standby;
        _gameState.unpurchasedProperties = new List<PropertyDeed>();

        for (int i = 0; i < BoardConstants.NProperties; i++)
        {
            _gameState.unpurchasedProperties.Add(new PropertyDeed()
            {
                propertyID = i,
                upgradeState = 0 // no houses etc
            });
        };

        // TODO once everything is added validate, that everything is set to default
        // For example, gameboard unpurchased properties and similar should be resetted
        // Reset everything to ZERO.

        _gameState.currentTurn = 0;
        var nPlayers = state.players.Count();

        for (int i = 0; i < nPlayers; i++)
        {
            var player = state.players[i];

            if (player.chosenCharacter == null)
                return;

            var newplayer = new Player()
            {
                name = player.name,
                money = BoardConstants.StartingPlayerMoney,
                character = (Character)player.chosenCharacter,
                properties = new List<PropertyDeed>(),
                location = 0,
                jailCount = -1,
            };
            _gameState.players.Add(newplayer);
        }
        _logger.Debug("Initialized MonopolyGame!");
    }

    /// <summary>
    /// Absolutely sets the player position.
    /// This means that the player will NOT move through the squares, but instead just be "teleported"
    /// Useful for cards/tiles that disallow getting GO money and similar.
    /// </summary>
    /// <param name="playername">The playername to move</param>
    /// <param name="playerPosition">The new player position</param>
    public void SetPlayerPosition(string playername, int playerPosition)
    {
        var player = FindPlayer(playername);
        if (player == null)
        {
            _logger.Warn(String.Format("Attempted to set non-existent player position: {0}", playername));
            return;
        }
        player.location = playerPosition;
        player.location %= BoardConstants.BoardSquares;
    }

    /// <summary>
    /// Moves player position given a dice roll.
    /// This effectively manually moves the player in a normal game.
    /// This will apply the necessary walkthrough effects.
    /// However the actual effect to be applied on the turn, will be handled later.
    /// </summary>
    /// <param name="player">The player to move</param>
    /// <param name="diceResult">The result of the dice, the amount of spaces to move the player</param>
    private void MovePlayerPosition(Player player, int[] diceResult)
    {
        // Update UI state.
        _gameState.uiState.displayDices = diceResult;

        // Process Roll
        _roll_result = _board.HandlePlayerDiceRoll(player, diceResult, _gameState);

        if (!_roll_result.requiredInput) // no required input. just apply any necessary effect and finish turn
        {
            if (_roll_result.effectToApply != null)
            {
                _board.ApplyEffect(_roll_result.effectToApply.effect, player, _gameState);
            }
            AttemptFinishTurn();
            return;
        }

        // there has to be at least either an effect or a possible auction.
        if (_roll_result.effectToApply == null && _roll_result.possibleAuction == null)
            throw new ArgumentException("Returned required input, despite to effect or property auction being present");

        // There's some input to be acknowledged.
        // there's something possibly to auction. Turn isn't done.
        _currentTurnPhase = TurnPhase.Choiceby;
        // Simply yield and await for further input
    }


    /// <summary>
    /// Handles the dice roll of the given player.
    ///
    /// This intended to be called as a normal procedure of every turn,
    /// however it's also intended to be called so the player can roll while in prison.
    /// </summary>
    /// <param name="playername">The player of the roll</param>
    /// <param name="diceResult">The result of the roll</param>
    public async Task HandleDiceRoll(string playername,
    int[] diceResult,
    MonopolyClone.Sockets.ServerSocketHandler handler)
    {
        var player = FindPlayer(playername);
        if (player == null)
        {
            _logger.Warn(String.Format("Attempted to handle non-existent player: {0}", playername));
            return;
        }

        // check if had three doubles
        if (_doublesCounter == 2 && diceResult[0] == diceResult[1])
        {
            _roll_result = new RollResult() { requiredInput = false, diceResult = diceResult }; // for display purposes
            // this is third double, so rip
            new MonopolyClone.TileEffects.GoToJailEffect().ExecuteEffect(player, _gameState.players, 10, _board);

            // Console.WriteLine($"Triple doubles detected, after effect: jailCount = {player.jailCount} doublesCounter = {_doublesCounter} jailRollsThisTurn = {_jailRollsThisTurn}");
            await handler.Broadcast("message-display",
            $"{player.name} had doubles three times in a row! Going to jail..");

            AttemptFinishTurn();
            return;
        };

        if (diceResult[0] == diceResult[1])
            await handler.Broadcast("message-display",
                $"{player.name} Rolled a doubles");

        // not in jail, so simply move
        if (player.jailCount == -1)
        {
            MovePlayerPosition(player, diceResult);
            return;
        }

        _jailRollsThisTurn++; // this roll is now effective counted in logic.
        _roll_result = new RollResult() { requiredInput = false, diceResult = diceResult }; // for display purposes

        // player is jailed, check if doubles was landed.
        if (diceResult[0] == diceResult[1])
        { // doubles, simply move and play WITHOUT
            player.jailCount = -1; // no longer in jail
            MovePlayerPosition(player, diceResult); // just move with same throw
            return;
        }

        if (player.jailCount == 2 && _jailRollsThisTurn == 3)
        {  // two turns + this roll, so just escape him with fees, he'll then figure if he loses
            player.jailCount = -1;
            player.money -= BoardConstants.JailFee;
            MovePlayerPosition(player, diceResult); // just move with same throw
            await handler.Broadcast("message-display",
            $"{player.name} paid {BoardConstants.JailFee} to escape jail after three failed turns");

            return;
        }

        if (_jailRollsThisTurn == 3)
        // if doubles wasn't landed. well just another turn in jail
        {  // fat luck champ, next turn
            player.jailCount++;
            AttemptFinishTurn();
            return;
        }


        // jail rolls are being added, so if it reaches here, just yield till 3 rolls
    }

    /// <summary>
    /// Determines if there's a current property waiting to be decided by the player if to be purchased or auctioned.
    /// This is intended to be called and verified before PlayerMakePropertyAuctionChoice below is called.
    /// </summary>
    /// <returns> True, if there's a property waiting to be bought/auctioned </returns>
    public bool IsPropertyWaitingOnAuctionChoice()
    {
        return (_currentTurnPhase == TurnPhase.Choiceby)
        && (_roll_result != null)
        && (_roll_result.possibleAuction != null);
    }

    /// <summary>
    /// Makes the choice of the player of the current turn to effectively auction or purchase the property.
    ///
    /// This is intended to be called after verifying IsPropertyWaitingOnAuctionChoice,
    /// as well as verifying the identity of the player.
    /// </summary>
    /// <param name="toAuction">True if the player intends to auction the property, false if it intends to buy it</param>
    /// <param name="handler">The socket handler, to emit periodic updates should the player auction</param>
    public void PlayerMakePropertyAuctionChoice(
        bool toAuction,
        MonopolyClone.Sockets.ServerSocketHandler handler)
    {
        if (!toAuction)
        {
            if (_roll_result == null || _roll_result.possibleAuction == null || _roll_result.effectToApply == null)
                throw new Exception("Trying to make auction choice, despite no roll result!");

            // player made choice to simply buy property.
            var player = _gameState.players[_gameState.currentTurn];
            var property = (MonopolyClone.TileEffects.PropertyEffect)_roll_result.effectToApply.effect;
            // Check for player money
            if (player.money < property.cost)
            {
                _logger.Debug("Player attempted to buy property despite not having enough money!");
                return; // cannot pay!
            }

            // Charge for property
            player.money -= property.cost;

            var deed = _roll_result.possibleAuction;
            var success = _gameState.unpurchasedProperties.Remove(deed);
            if (!success)
            {
                throw new ArgumentException("Tried to auction already purchased property!");
            }

            // Add title deed to properties
            player.properties.Add(deed);

            // just finish turn
            AttemptFinishTurn();
        }
        else
        {   // property is auctioned!
            _currentTurnPhase = TurnPhase.Auctionby; // move to auction await.

            // initialize bids
            List<Bid> bids = new List<Bid>();
            var maxBids = new int[_gameState.players.Count()];

            for (int i = 0; i < _gameState.players.Count(); i++)
            {
                bids.Add(new Bid() { bidder = _gameState.players[i].name, bidAmount = 1 });
                maxBids[i] = _gameState.players[i].money;
            }

            if (_roll_result == null || _roll_result.possibleAuction == null)
                throw new ArgumentException("Auctioning non existant property?");

            _runningAuction = new Auction()
            {
                auctionedProperty = _roll_result.possibleAuction.propertyID,
                bids = bids,
                topBid = _gameState.currentTurn, // dude who landed
                currentAuctionDeadline = (DateTimeOffset.Now.ToUnixTimeMilliseconds() + (long)AuctionHandler.auctionDurationSeconds * 1000)
            };

            AuctionHandler.StartAuction(_runningAuction,
            () =>
            {
                BroadcastStateUpdate(handler).Wait();
            },
            () =>
            {
                Bid winningBid = _runningAuction.bids[_runningAuction.topBid];
                _runningAuction = null; // kill auction
                handler.Broadcast("message-display",
                    $"Auction sold to: {winningBid.bidder} by winning bid of {winningBid.bidAmount}").Wait();

                Console.WriteLine($"Winner of auction: {winningBid.bidder} by bidding an amount of {winningBid.bidAmount}");

                // sell the property to auction winner
                Player? auctionWinner = FindPlayer(winningBid.bidder);

                if (auctionWinner == null)
                    throw new ArgumentException("Winner of auction doesn't exist?");

                // Charge for property
                auctionWinner.money -= winningBid.bidAmount;
                if (_roll_result == null || _roll_result.possibleAuction == null)
                    throw new ArgumentException("Just auctioned non existent property?");

                var deed = _roll_result.possibleAuction;
                var success = _gameState.unpurchasedProperties.Remove(deed);
                if (!success)
                    throw new ArgumentException("Tried to auction already purchased property!");

                // Add title deed to properties
                auctionWinner.properties.Add(deed);

                AttemptFinishTurn();
                BroadcastStateUpdate(handler).Wait();
            }, maxBids);

        }
    }


    /// <summary>
    /// Determines whether there's currently a running auction.
    /// /// </summary>
    /// <returns></returns>
    public bool IsAuctionRunning()
    {
        return _runningAuction != null && _currentTurnPhase == TurnPhase.Auctionby;
    }

    /// <summary>
    /// Determines if there's an effect waiting to be acknowledged.
    /// This is intended to be called and verified before PlayerAcknowledgeEffect below is called.
    /// </summary>
    public bool IsEffectWaitingOnAcknowledge()
    {
        return (_currentTurnPhase == TurnPhase.Choiceby)
        && (_roll_result != null)
        && (_roll_result.effectToApply != null)
        && (_roll_result.possibleAuction == null); // IF there's an effect, but it's not a a property to auction, then it's an effect
    }

    /// <summary>
    /// This effect is run so that the player acknowledges any on standby effects and the turn procedes.
    ///
    /// This is intended to be called externally,
    /// once verified the authenticity of the player, as well as the turn phase to properly perform the call.
    /// </summary>
    public void PlayerAcknowledgeEffect()
    {
        if (_roll_result == null)
            throw new ArgumentException("Attempted to acknowledge a player effect, without any turn result being available. i.e. Dice were not thrown previously");

        if (_roll_result.effectToApply == null)
            throw new ArgumentException("Attempted to acknowledge effect, but effect is null!");

        // actually apply the effect.
        _board.ApplyEffect(_roll_result.effectToApply.effect, _gameState.players[_gameState.currentTurn], _gameState);
        // finish the turn.
        AttemptFinishTurn();
    }


    /// <summary>
    /// Determines whether it is that player turn or not.
    /// Returns false if player doesn't exist.
    /// </summary>
    /// <param name="playername">The player name to check</param>
    /// <returns>True, if it is that player turn. False otherwise</returns>
    public bool IsPlayerTurn(string playername)
    {
        for (int i = 0; i < _gameState.players.Count(); i++)
        {
            if (_gameState.players[i].name == playername && i == _gameState.currentTurn)
                return true;
        }
        return false;
    }

    /// <summary>
    /// Determines whether the current player is part of the current game.
    /// </summary>
    /// <param name="playername">The player name to check</param>
    /// <returns>True, if the player is currently player. False otherwise e.g. an expectator</returns>
    public bool IsGameCurrentPlayer(string playername)
    {
        for (int i = 0; i < _gameState.players.Count(); i++)
        {
            if (_gameState.players[i].name == playername)
                return true;
        }
        return false;
    }

    /// <summary>
    /// Attempts to Finish turn the current turn, and goes on to the next person.
    /// Performs doubles result verification and if double was landed, simply resets.
    /// </summary>
    public void AttemptFinishTurn()
    {
        if (!PerformGameChecks())
            return; // a player is in the negatives. Await for them to finish. Or well, the game's already over anyway.

        bool doublesPlayAgain = false;
        if (_roll_result != null)
            doublesPlayAgain = (
                _roll_result.diceResult[0] == _roll_result.diceResult[1] // if got a double
                && _gameState.players[_gameState.currentTurn].jailCount == -1 // and not in jail
                && _jailRollsThisTurn == 0 // And wasn't previously in jail
            ); // then doubles have the ability to play again



        _roll_result = null;
        _currentTurnPhase = TurnPhase.Standby;
        _runningAuction = null; // delete auction just in case
        _hasUpgradedPropertyThisTurn = false;
        _jailRollsThisTurn = 0;


        // if player got double, but performed at least one throw in jail.
        // this means he was in jail, so his double should NOT be counted.
        if (!doublesPlayAgain) // Don't switch to next player
        {
            _gameState.currentTurn += 1;
            _gameState.currentTurn %= _gameState.players.Count();
            _doublesCounter = 0; // reset double counter
        }
        else
        {
            _doublesCounter++; // add one
        }
    }


    /// <summary>
    /// Generates, updates and store a proper UIState, before broadcasting.
    /// </summary>
    public void GenerateUIState(MonopolyClone.Sockets.ServerSocketHandler handler)
    {
        UIPropertyToBuy? propertyToBuy = null;
        EffectToApply? awaitingEffect = null;
        var diceResult = _gameState.uiState.displayDices; // use previous by default
        if (_roll_result != null) // if there's a new result, use that one
        {
            diceResult = _roll_result.diceResult;

            if (IsPropertyWaitingOnAuctionChoice() && _roll_result.effectToApply != null)
            {
                var awaitingProperty = ((MonopolyClone.TileEffects.PropertyEffect)_roll_result.effectToApply.effect);
                propertyToBuy = new UIPropertyToBuy()
                {
                    propertyID = awaitingProperty.propertyID,
                    price = awaitingProperty.cost,
                };
            }

            if (IsEffectWaitingOnAcknowledge())
            {
                awaitingEffect = _roll_result.effectToApply;
            }
        }

        var connectedPlayerNames = new HashSet<string>(handler.GetConnectedUsers());

        var connectedPlayers = new bool[_gameState.players.Count];

        for (int i = 0; i < _gameState.players.Count; i++)
        {
            connectedPlayers[i] = connectedPlayerNames.Contains(_gameState.players[i].name);
        }
        // check for connected players
        _gameState.uiState = new UIState()
        {
            turnPhase = _currentTurnPhase,
            displayDices = diceResult,
            propertyToBuy = propertyToBuy,
            effectToAcknowledge = awaitingEffect,
            currentAuction = _runningAuction,
            currentTrade = _tradeHandler.GetCurrentTrade(),
            hasPurchasedUpgrade = _hasUpgradedPropertyThisTurn,
            connectedUpkeep = connectedPlayers
        };
    }

    /// <summary>
    /// Loads an existing game state.
    /// </summary>
    /// <param name="toLoad">The game state to load</param>
    public void LoadSavedGame(GameState toLoad)
    {
        _gameState = toLoad;
        if (_gameState.players.Count() < 2)
            throw new ArgumentException("Game state with invalid players given!");
        _listeningEventLabel = EventLabel.Default;

    }

    public async Task EmitStateUpdate(MonopolyClone.Sockets.UserSocket playerSocket, MonopolyClone.Sockets.ServerSocketHandler handler)
    {
        GenerateUIState(handler);
        await playerSocket.Emit("state-update", _gameState);
    }

    public async Task BroadcastStateUpdate(MonopolyClone.Sockets.ServerSocketHandler handler)
    {
        GenerateUIState(handler);
        if (_listeningEventLabel == EventLabel.GameDone)
            await handler.Broadcast("game-done-results", GetGameResults());
        else
            await handler.Broadcast("state-update", _gameState);
    }

    public GameResults GetGameResults()
    {
        var playersWorth = new List<int>();

        _gameState.players.ForEach(e =>
        {
            playersWorth.Add(CalculatePlayerPropertyWorth(e) + e.money);
        });

        return new GameResults()
        {
            players = _gameState.players,
            netWorth = playersWorth
        };
    }

    /// <summary>
    /// Returns whether there's a current active trade
    /// </summary>
    /// <returns>True if there's an active trade, false otherwise</returns>
    public bool IsActiveTrade()
    {
        return _tradeHandler.isActiveTrade();
    }

    /// <summary>
    /// Initiates a trade between two players.
    /// </summary>
    /// <param name="source">The initiator of the trade</param>
    /// <param name="target">The player to trade with</param>
    public void StartTrade(string source, string target)
    {
        var initiator = FindPlayer(source);
        var tradeTarget = FindPlayer(target);

        if (initiator == null || tradeTarget == null)
            return;

        _tradeHandler.StartNewTrade(initiator, tradeTarget);
    }

    /// <summary>
    /// Sets the trade offer for an ongoing trade
    /// </summary>
    /// <param name="player">The player offer's to modify</param>
    /// <param name="newOffer">The new offer to set</param>
    public void SetTradeOffer(string player, TradeOffer newOffer)
    {
        _tradeHandler.SetOffer(player, newOffer);
    }

    /// <summary>
    /// Sets the player consent for the trade.
    /// Which can be true, in which case the player accepts the current terms of the trade
    /// </summary>
    /// <param name="player">The player consenting</param>
    /// <param name="newConsent">His new consent status</param>
    public void SetTradeConsent(string player, bool newConsent)
    {
        _tradeHandler.SetConsent(player, newConsent);
    }


    /// <summary>
    /// Determines if the given player is part of a current active trade
    /// </summary>
    /// <param name="player">The players name</param>
    /// <returns>Whether the player is currently participating in an active trade</returns>
    public bool isTradeRecipient(string player)
    {
        return _tradeHandler.isTradeRecipient(player);
    }


    /// <summary>
    /// Cancels an ongoing trade, should there be one
    /// </summary>
    public void CancelTrade()
    {
        _tradeHandler.CancelCurrentTrade();
    }


    /// <summary>
    /// Attempts to upgrade the given property.
    ///
    /// Verifies that the upgrade is valid, else will fail.
    /// This implies, the player must own the property, has all of same color, has money, etc
    /// </summary>
    /// <param name="playername">The name of the player upgrading the property</param>
    /// <param name="propertyID">The property to upgrade</param>
    /// <returns>Whether the upgrade was successful</returns>
    public bool UpgradeProperty(string playername, int propertyID)
    {
        Player? player = FindPlayer(playername);
        if (player == null)
            return false;

        if (propertyID < 0 || propertyID > (BoardConstants.NProperties - 1))
            return false;

        MonopolyClone.TileEffects.PropertyEffect? property = null;
        // find actual property
        foreach (var tile in _board.Tiles)
        {
            if (tile.effect != null && tile.effect.effectID == 0)
            {
                property = (MonopolyClone.TileEffects.PropertyEffect)tile.effect;
                if (property.propertyID == propertyID)
                {
                    break;
                }
                else
                {
                    property = null;
                }
            }
        }

        if (property == null)
            throw new ArgumentException($"Could not find property to upgrade with ID {propertyID}");

        // verify that he owns the property.
        var foundIndex = player.properties.FindIndex(e => e.propertyID == property.propertyID);
        if (foundIndex == -1)
            return false; // doesn't own the property

        // check for mortgage exception
        if (player.properties[foundIndex].upgradeState == -1)
        {
            // property is mortgaged. trying to unmortgage,
            // no more complex checks are needed, and not part of the upgrade once per turn rule

            // just check for upgrade money
            int mortgageMoney = property.cost / 2;
            if (player.money < mortgageMoney)
                return false;

            // undo mortgage
            player.money -= mortgageMoney;
            player.properties[foundIndex].upgradeState = 0;
            return true;
        }


        // verify that property is even upgradable
        if (property.colorGroup == 8 || property.colorGroup == 9) // transport and service cannot be upgraded.
            return false;

        // verify that has not reached max already
        if (player.properties[foundIndex].upgradeState == 5) // 5 is hotel, and max
            return false;

        // verify that he owns ALL of the same color.
        var colorCount = MonopolyClone.TileEffects.PropertyEffect.countOwnedCategories(property.colorGroup, player, _board.Tiles);

        bool ownsAll = false;
        if (property.colorGroup == 0 || property.colorGroup == 7)
        {
            ownsAll = colorCount == 2; // only 2 for brown and blue
        }
        else
        {
            ownsAll = colorCount == 3; //3 for rest
        }

        if (!ownsAll) // doesn't own all properties
            return false;

        // verify if he has upgraded in this same turn
        if (_hasUpgradedPropertyThisTurn)
            return false;

        int costOfUpgrade;
        if (property.colorGroup < 8)
        {
            costOfUpgrade = BoardConstants.UpgradePrices[property.colorGroup / 2];
        }
        else
        {
            throw new ArgumentException("Received invalid property to calculate cost of upgrade");
        }

        if (player.money < costOfUpgrade) // not enough money
            return false;

        // passed all checks, upgrade
        player.money -= costOfUpgrade;
        player.properties[foundIndex].upgradeState++;
        _hasUpgradedPropertyThisTurn = true;
        return true;
    }

    /// <summary>
    /// attempts to downgrade a given property. This is also known as selling houses/ mortgaging.
    ///
    /// verifies that the operation is valid and performs the necessary operations to do so.
    /// </summary>
    /// <param name="playername">The name of the player downgrading the property</param>
    /// <param name="propertyID">The property to downgrade</param>
    /// <returns>Whether the downgrade</returns>
    public bool DowngradeProperty(string playername, int propertyID)
    {
        Player? player = FindPlayer(playername);
        if (player == null)
            return false;

        if (propertyID < 0 || propertyID > (BoardConstants.NProperties - 1))
            return false;

        MonopolyClone.TileEffects.PropertyEffect? property = null;
        // find actual property
        foreach (var tile in _board.Tiles)
        {
            if (tile.effect != null && tile.effect.effectID == 0)
            {
                property = (MonopolyClone.TileEffects.PropertyEffect)tile.effect;
                if (property.propertyID == propertyID)
                {
                    break;
                }
                else
                {
                    property = null;
                }
            }
        }

        if (property == null)
            throw new ArgumentException($"Could not find property to upgrade with ID {propertyID}");

        // verify that he owns the property.
        var foundIndex = player.properties.FindIndex(e => e.propertyID == property.propertyID);
        if (foundIndex == -1)
            return false; // doesn't own the property

        // verify that its not mortgaged / cannot downgrade further already
        if (player.properties[foundIndex].upgradeState == -1)
            return false;

        // check if it's a mortgage or selling a house
        if (player.properties[foundIndex].upgradeState == 0)
        {
            // it's a mortgage so simply, give player the money and set mortgage value
            player.money += (int)(property.cost / 2);
            player.properties[foundIndex].upgradeState = -1;
            return true;
        }

        // it's a downgrade, selling house

        int costOfUpgrade;
        if (property.colorGroup < 8)
        {
            costOfUpgrade = BoardConstants.UpgradePrices[property.colorGroup / 2];
        }
        else
        {
            throw new ArgumentException("Received invalid property to calculate cost of upgrade");
        }

        player.money += (int)costOfUpgrade / 2; // sell back to half-price of what they were valued
        player.properties[foundIndex].upgradeState--; // downgrade
        return true;
    }

    public GameState GameState => _gameState;
}