using MonopolyClone.Common;

namespace MonopolyClone.Lobby;

public class LobbyHandler
{
    private static readonly LobbyHandler _instance = new LobbyHandler();

    public static LobbyHandler Instance => _instance;

    private LobbyState _currentState;

    private ReaderWriterLockSlim _synclock;

    private LobbyHandler()
    {
        _currentState = new LobbyState();
        _synclock = new ReaderWriterLockSlim();
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

    }

    public void OnLobbyLeave(String playername)
    {

    }


}
