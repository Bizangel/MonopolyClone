using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Sockets;
using NLog;

namespace MonopolyClone.Handler;

public class MonopolyHandler
{
    private static readonly MonopolyHandler _instance = new MonopolyHandler();
    private MonopolyHandler()
    {
        _logger = LogManager.GetCurrentClassLogger();
    }

    private readonly Logger _logger;

    public static MonopolyHandler Instance => _instance;

    /// <summary>
    /// Readies and broadcasts the current status update to all connected clients
    /// </summary>
    /// <param name="serversocket">The server socket handler to broadcast to clients</param>
    public async Task BroadcastGameStateUpdate(ServerSocketHandler serversocket)
    {
        // await serversocket.BroadcastMessage();
    }

}