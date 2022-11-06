using MonopolyClone.Common;

namespace MonopolyClone.Lobby;

[Serializable]
public class LobbyPlayer
{
    public string name { get; set; } = "";

    public Character chosenCharacter { get; set; }
}

[Serializable]
public class LobbyState
{
    public LobbyPlayer[] players { get; set; } = new LobbyPlayer[0];

}