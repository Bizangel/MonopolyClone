using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using NLog;

namespace MonopolyClone.Game;

public class MonopolyGame
{
    // Singleton
    private static readonly MonopolyGame _instance = new MonopolyGame();
    private MonopolyGame()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _instance.InitializeGame();
    }

    private readonly Logger _logger;

    public static MonopolyGame Instance => _instance;

    private GameState _gameState = new GameState();
    private TurnPhase _currentTurnPhase = TurnPhase.Standby;

    /// <summary>
    /// Searches for the player with the specified name. Returns null if it doesn't exist.
    /// </summary>
    /// <param name="playername">The player name to search for</param>
    /// <returns>The requested Player or Null if it is not found</returns>
    private Player? FindPlayer(string playername)
    {
        foreach (var player in _gameState.Players)
        {
            if (player.Name == playername)
                return player;
        }
        return null;
    }

    // Someone needs to call this to start a game.
    // Ideally an admin or something.
    // To start a game, we need to know, who's gonna play (Names)
    // and the characters of those players (car, thimble, etc)
    // and the order of the players (this matters!)
    public void InitializeGame()
    {
        var PlayerOrder = new string[] { "string", "bizangel" };
        var Characters = new Character[] { Character.Car, Character.Hat };

        // TODO VALIDATE INPUT
        // NO DUPLICATE PLAYERS AS WELL AS NO DUPLICATE CHARACTERS.

        _currentTurnPhase = TurnPhase.Standby;

        // TODO once everything is added validate, that everything is set to default
        // For example, gameboard unpurchased properties and similar should be resetted
        // Reset everything to ZERO.
        _gameState.CurrentTurn = 0;
        var nPlayers = Characters.Count();

        _gameState.Players = new Player[nPlayers];

        for (int i = 0; i < nPlayers; i++)
        {
            _gameState.Players[i].Location = 0; // all start in position 0
            _gameState.Players[i].Money = BoardConstants.StartingPlayerMoney;
            _gameState.Players[i].character = Characters[i];
            _gameState.Players[i].Name = PlayerOrder[i];
            _gameState.Players[i].Properties = new Property[0];
        }
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
        player.Location = playerPosition;
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
        player.Location += diceResult % BoardConstants.BoardSquares;
    }

    /// <summary>
    /// Determines whether it is that player turn or not.
    /// Returns false if player doesn't exist.
    /// </summary>
    /// <param name="playername">The player name to check</param>
    /// <returns>True, if it is that player turn. False otherwise</returns>
    public bool IsPlayerTurn(string playername)
    {
        for (int i = 0; i < _gameState.Players.Count(); i++)
        {
            if (_gameState.Players[i].Name == playername && i == _gameState.CurrentTurn)
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
}