using System.Text;
using System.Text.Json;
using System.Buffers;

namespace WebSocketsHandler.Controllers.Events;


public interface SocketEvent {

    void Run(string payload);

}