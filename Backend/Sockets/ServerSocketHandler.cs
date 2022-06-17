using System.Buffers;
using System.Text;
using System.Text.Json;


namespace MonopolyClone.Sockets;

public class ServerSocketHandler
{
    private List<UserSocket> _sockets;

    public ServerSocketHandler()
    {
        _sockets = new List<UserSocket>();
    }

    public void AddSocket(UserSocket socket)
    {
        _sockets.Add(socket);
    }

}