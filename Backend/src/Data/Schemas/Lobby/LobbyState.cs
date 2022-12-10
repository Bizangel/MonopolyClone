using MonopolyClone.Common;

namespace MonopolyClone.Lobby;

[Serializable]
public class LobbyPlayer
{
    required public string name { get; set; }

    required public Character? chosenCharacter { get; set; }
}

[Serializable]
public class LobbyState
{
    required public List<LobbyPlayer> players { get; set; } = new List<LobbyPlayer>();
}