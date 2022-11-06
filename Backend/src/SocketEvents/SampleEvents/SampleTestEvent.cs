
using MonopolyClone.Sockets;
using NLog;
namespace MonopolyClone.Events;


public static class SampleTestEvent
{
    [SocketEventLabel(EventLabel.Lobby)]
    [SocketEvent("sampleEvent")]
    public static async Task Run(UserSocket user, ServerSocketHandler handler, string payload)
    {
        var _logger = LogManager.GetCurrentClassLogger();
        _logger.Debug($"Received Event from {user.Username} with payload {payload}");

        await user.Emit("testEvent", "Hello World from Server!");
    }

}