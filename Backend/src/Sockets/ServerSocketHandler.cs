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
        //_sockets.TryRemove(socket.Username, out _);
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

    // public async Task BroadcastMessage(string message)
    // {
    //     // foreach (var socket in _sockets)
    //     // {
    //     //     await socket.SendMessage(message);
    //     // }
    // }



}