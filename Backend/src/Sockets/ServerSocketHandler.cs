using System.Collections.Concurrent;

namespace MonopolyClone.Sockets;

public class ServerSocketHandler
{
    private Dictionary<string, UserSocket> _sockets;
    public ServerSocketHandler()
    {
        _sockets = new Dictionary<string, UserSocket>();
    }

    public void RegisterSocket(UserSocket socket)
    {
        _sockets.TryAdd(socket.Username, socket);
    }

    public void UnregisterSocket(UserSocket socket)
    {
        _sockets.Remove(socket.Username);
    }

    public bool AlreadyConnected(string username)
    {
        return _sockets.ContainsKey(username);
    }

    public List<string> GetConnectedUsers()
    {
        return _sockets.Keys.ToList();
    }

    public async Task Broadcast(string eventID, dynamic payload, string? exclude = null)
    {
        foreach (var socket in _sockets)
        {
            if (exclude != null && socket.Key == exclude)
                continue;
            await socket.Value.Emit(eventID, payload);
        }
    }



}