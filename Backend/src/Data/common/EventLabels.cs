
namespace MonopolyClone.Events;

public enum EventLabel
{
    /// The default event labels. These will be auto-defaulted when no specifier is used.
    Default,
    Lobby,
    // when the game is done. for now, the server is intended to be shut down and manually resetted for a new game.
    GameDone,
}