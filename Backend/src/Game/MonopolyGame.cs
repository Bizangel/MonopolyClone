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

    private static readonly MonopolyGame _instance = new MonopolyGame();
    public static MonopolyGame Instance => _instance;

    // public static void InitializeGameInstance() { _instance = new MonopolyGame(); }
    // // Singleton
    // private static MonopolyGame? _instance = null;
    private MonopolyGame()
    {
        _logger = LogManager.GetCurrentClassLogger();
    }

    private readonly Logger _logger;

    // public static MonopolyGame Instance
    // {
    //     get
    //     {
    //         if (_instance == null)
    //         {
    //             throw new InvalidOperationException("Attempted to access MonopolyGame Instance and wasn't initialized!");
    //         }

    //         return _instance;
    //     }
    // }

    private GameState _gameState = new GameState();
    private TurnPhase _currentTurnPhase = TurnPhase.Standby;

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
    /// Sets the game into Lobby state.
    /// Makes it listen for lobby connections, and basic game events will be ignored.
    /// </summary>
    public void SetLobbyState()
    {
        _listeningEventLabel = EventLabel.Lobby;
    }

    // Someone needs to call this to start a game.
    // Ideally an admin or something.
    // To start a game, we need to know, who's gonna play (Names)
    // and the characters of those players (car, thimble, etc)
    // and the order of the players (this matters!)
    public void InitializeGame()
    {
        _listeningEventLabel = EventLabel.Default; // Make it listen to default events instead of lobby ones.

        var PlayerOrder = new string[] { "string", "bizangel" };
        var Characters = new Character[] { Character.Car, Character.Hat };

        // TODO VALIDATE INPUT
        // NO DUPLICATE PLAYERS AS WELL AS NO DUPLICATE CHARACTERS.

        _currentTurnPhase = TurnPhase.Standby;

        // TODO once everything is added validate, that everything is set to default
        // For example, gameboard unpurchased properties and similar should be resetted
        // Reset everything to ZERO.
        _gameState.currentTurn = 0;
        var nPlayers = Characters.Count();

        _gameState.players = new Player[nPlayers];


        for (int i = 0; i < nPlayers; i++)
        {
            _gameState.players[i] = new Player();
            _gameState.players[i].location = 0; // all start in position 0
            _gameState.players[i].money = BoardConstants.StartingPlayerMoney;
            _gameState.players[i].character = Characters[i];
            _gameState.players[i].name = PlayerOrder[i];
            _gameState.players[i].properties = new Property[0];
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
    }

    /// <summary>
    /// Moves player position given a dice roll.
    /// This effectively manually moves the player in a normal game and applies necessary effects.
    /// </summary>
    /// <param name="playername">The name of the player to move</param>
    /// <param name="diceResult">The result of the dice, the amount of spaces to move the player</param>
    public void MovePlayerPosition(string playername, int diceResult)
    {
        var player = FindPlayer(playername);
        if (player == null)
        {
            _logger.Warn(String.Format("Attempted to move non-existent player: {0}", playername));
            return;
        }
        player.location += diceResult % BoardConstants.BoardSquares;
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
    /// Transitions the current turn phase into the next one.
    /// </summary>
    /// <param name="playerName"></param>
    public void NextPhase()
    {
        switch (_currentTurnPhase)
        {
            case TurnPhase.Standby:
                _currentTurnPhase = TurnPhase.Rollby;
                break;
            case TurnPhase.Rollby:
                _currentTurnPhase = TurnPhase.Purchaseby;
                break;
            case TurnPhase.Purchaseby:
                _logger.Warn("Tried to proceed to next phase after being in Purchaseby phase (final phase)");
                break;
        }
    }


    /// <summary>
    /// Builds and returns the current state update.
    /// </summary>
    /// <returns>The current state updated</returns>
    public GameState GetStateUpdate()
    {
        return _gameState;
    }
}