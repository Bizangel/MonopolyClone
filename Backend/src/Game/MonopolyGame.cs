using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Events;
using NLog;

namespace MonopolyClone.Game;

public class MonopolyGame
{
    /// <summary>
    /// Defines which events will be listened to and which will be ignored.
    /// </summary>
    private EventLabel _listeningEventLabel = EventLabel.Default;
    public EventLabel ListeningEventLabel => _listeningEventLabel;

    private GameBoard _board;
    private static readonly MonopolyGame _instance = new MonopolyGame();
    public static MonopolyGame Instance => _instance;

    private MonopolyGame()
    {
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

    /// <summary>
    /// Performs necessary game checks for several things.
    /// Mainly to see players money going below negative and then ending the game properly.
    ///
    /// This function will be called multiple times to perform verifications.
    /// Do make it relatively stateless and do not rely on the fact on how many times it will be executed,
    /// as it can and WILL be executed multiple times in a same turn.
    /// </summary>
    private void PerformGameChecks()
    {
        foreach (var player in _gameState.players)
        {
            if (player.money <= 0)
            {
                throw new Exception("Game finished! (Handle this properly of course)");
            }
        }
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
    /// <param name="playername">The name of the player to move</param>
    /// <param name="diceResult">The result of the dice, the amount of spaces to move the player</param>
    public void MovePlayerPosition(string playername, int[] diceResult)
    {
        var player = FindPlayer(playername);
        if (player == null)
        {
            _logger.Warn(String.Format("Attempted to move non-existent player: {0}", playername));
            return;
        }

        // Update UI state.
        _gameState.uiState.displayDices = diceResult;

        // Process Roll
        _roll_result = _board.HandlePlayerDiceRoll(player, diceResult, _gameState);
        PerformGameChecks();

        if (!_roll_result.Value.requiredInput) // no required input. just apply any necessary effect and finish turn
        {
            if (_roll_result.Value.effectToApply != null)
            {
                _board.ApplyEffect(_roll_result.Value.effectToApply, player, _gameState);
            }
            AttemptFinishTurn();
            return;
        }

        // there has to be at least either an effect or a possible auction.
        if (_roll_result.Value.effectToApply == null && _roll_result.Value.possibleAuction == null)
            throw new ArgumentException("Returned required input, despite to effect or property auction being present");

        // There's some input to be acknowledged.
        // there's something possibly to auction. Turn isn't done.
        _currentTurnPhase = TurnPhase.Choiceby;
        // Simply yield and await for further input
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
        && (_roll_result.Value.possibleAuction != null);
    }


    /// <summary>
    /// Makes the choice of the player of the current turn to effectively auction or purchase the property.
    ///
    /// This is intended to be called after verifying IsPropertyWaitingOnAuctionChoice,
    /// as well as verifying the identity of the player.
    /// </summary>
    public void PlayerMakePropertyAuctionChoice(bool toAuction)
    {
        if (!toAuction)
        {
            if (_roll_result == null || _roll_result.Value.possibleAuction == null || _roll_result.Value.effectToApply == null)
                throw new Exception("Trying to make auction choice, despite no roll result!");

            // player made choice to simply buy property.
            var deed = _roll_result.Value.possibleAuction;
            var success = _gameState.unpurchasedProperties.Remove(deed);
            if (!success)
            {
                throw new ArgumentException("Tried to auction already purchased property!");
            }

            var player = _gameState.players[_gameState.currentTurn];
            var property = (MonopolyClone.TileEffects.PropertyEffect)_roll_result.Value.effectToApply;
            // Check for player money
            if (player.money < property.cost)
            {
                _logger.Debug("Player attempted to buy property despite not having enough money!");
                return; // cannot pay!
            }

            // Charge for property
            player.money -= property.cost;

            // Add title deed to properties
            player.properties.Add(deed);

            // just finish turn
            AttemptFinishTurn();
        }
        else
        {   // property is auctioned!
            _currentTurnPhase = TurnPhase.Auctionby; // move to auction await.
        }
    }

    /// <summary>
    /// Determines if there's an effect waiting to be acknowledged.
    /// This is intended to be called and verified before PlayerAcknowledgeEffect below is called.
    /// </summary>
    public bool IsEffectWaitingOnAcknowledge()
    {
        return (_currentTurnPhase == TurnPhase.Choiceby)
        && (_roll_result != null)
        && (_roll_result.Value.effectToApply != null);
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

        if (_roll_result.Value.effectToApply == null)
            throw new ArgumentException("Attempted to acknowledge effect, but effect is null!");

        // actually apply the effect.
        _board.ApplyEffect(_roll_result.Value.effectToApply, _gameState.players[_gameState.currentTurn], _gameState);
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
    /// Attempts to Finish turn the current turn, and goes on to the next person.
    /// Performs doubles result verification and if double was landed, simply resets.
    /// </summary>
    public void AttemptFinishTurn()
    {
        if (_roll_result != null &&
        _roll_result.Value.diceResult[0] == _roll_result.Value.diceResult[1]) // Doubles
        {
            _currentTurnPhase = TurnPhase.Standby;
            return; // effectively yield
        }

        // TODO add handling here for jail ()

        _roll_result = null;
        _currentTurnPhase = TurnPhase.Standby;
        _gameState.currentTurn += 1;
        _gameState.currentTurn %= _gameState.players.Count();
    }


    /// <summary>
    /// Generates, updates and store a proper UIState, before broadcasting.
    /// </summary>
    public void GenerateUIState()
    {
        var diceResult = _gameState.uiState.displayDices; // use previous by default
        if (_roll_result != null) // if there's a new result, use that one
        {
            diceResult = _roll_result.Value.diceResult;
        }

        _gameState.uiState = new UIState() { turnPhase = _currentTurnPhase, displayDices = diceResult };
    }

    /// <summary>
    /// Builds and returns the current state update.
    /// </summary>
    /// <returns>The current state updated</returns>
    public GameState GetStateUpdate()
    {
        GenerateUIState();
        return _gameState;
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

    public async Task BroadcastStateUpdate(MonopolyClone.Sockets.ServerSocketHandler handler)
    {
        GenerateUIState();
        await handler.Broadcast("state-update", _gameState);
    }
}