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

    private GameState _gameState = new GameState();
    private TurnPhase _currentTurnPhase = TurnPhase.Standby;

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

        // TODO once everything is added validate, that everything is set to default
        // For example, gameboard unpurchased properties and similar should be resetted
        // Reset everything to ZERO.

        _gameState.currentTurn = 0;
        var nPlayers = state.players.Count();

        _gameState.players = new Player[nPlayers];

        for (int i = 0; i < nPlayers; i++)
        {
            var player = state.players[i];

            if (player.chosenCharacter == null)
                return;

            _gameState.players[i] = new Player();
            _gameState.players[i].location = 0; // all start in position 0
            _gameState.players[i].money = BoardConstants.StartingPlayerMoney;
            _gameState.players[i].character = (Character)player.chosenCharacter;
            _gameState.players[i].name = player.name;
            _gameState.players[i].properties = new PropertyDeed[0];
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
    /// This effectively manually moves the player in a normal game and applies necessary effects.
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
        player.location += diceResult.Sum();
        player.location %= BoardConstants.BoardSquares;

        // Update UI state.
        _gameState.uiState.displayDices = diceResult;
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
    /// Finishes the current turn, and goes on to the next person.
    /// </summary>
    public void FinishNextTurn()
    {
        _gameState.currentTurn += 1;
        _gameState.currentTurn %= _gameState.players.Count();
    }


    /// <summary>
    /// Builds and returns the current state update.
    /// </summary>
    /// <returns>The current state updated</returns>
    public GameState GetStateUpdate()
    {
        return _gameState;
    }

    /// <summary>
    /// Loads an existing game state.
    /// </summary>
    /// <param name="toLoad">The game state to load</param>
    public void LoadSavedGame(GameState toLoad)
    {
        _gameState = toLoad;
        if (_gameState.players.Length < 2)
            throw new ArgumentException("Game state with invalid players given!");
        _listeningEventLabel = EventLabel.Default;

    }

    public async Task BroadcastStateUpdate(MonopolyClone.Sockets.ServerSocketHandler handler)
    {
        await handler.Broadcast("state-update", _gameState);
    }
}