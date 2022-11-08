using MonopolyClone.Auth.SecretGenerator;
using MonopolyClone.Common;
using NLog;

namespace MonopolyClone.Lobby;

public class LobbyHandler
{
    private readonly Logger _logger;
    private static readonly LobbyHandler _instance = new LobbyHandler();
    public static LobbyHandler Instance => _instance;
    private LobbyState _currentState;
    private readonly object _synclock = new Object();

    private string _lobbyPass;

    private LobbyHandler()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _currentState = new LobbyState();
        _lobbyPass = SecretGenerator.GetUniqueSecret(20);
    }

    public LobbyState GetLobbyUpdate()
    {
        return _currentState;
    }


    public bool AttemptSelect(String playername, Character ChosenCharacter)
    {
        return false;
    }

    public void OnLobbyJoin(String playername)
    {
        lock (_synclock)
        {
            _currentState.players.RemoveAll((e) => e.name == playername); // remove any duplicates
            _currentState.players.Add(new LobbyPlayer() { name = playername, chosenCharacter = null });
        }
    }

    public void OnLobbyLeave(String playername)
    {
        lock (_synclock)
        {
            _currentState.players.RemoveAll((e) => e.name == playername);
        }
    }

    public string GetLobbyPass()
    {
        return _lobbyPass;
    }


}
