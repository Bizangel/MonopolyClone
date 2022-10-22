using System.CodeDom.Compiler;
using System.Reflection;
using MonopolyClone.Sockets;
using NLog;

namespace MonopolyClone.Events;


public delegate Task SocketEvent(UserSocket userSocket, string payload, ServerSocketHandler handler);
public delegate void OnSocketConnectionLostEvent(string dc_user);

public static class SocketsEventHandler
{
    private static readonly Logger _logger;
    private static Dictionary<string, SocketEvent> _registeredEvents;
    private static List<OnSocketConnectionLostEvent> _onConnectionLostEvents;

    static SocketsEventHandler()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _registeredEvents = new Dictionary<string, SocketEvent>();
        _onConnectionLostEvents = new List<OnSocketConnectionLostEvent>();
    }

    public static void HandleEvent(string EventID, UserSocket userSocket, string payload, ServerSocketHandler socketHandler)
    {
        if (!_registeredEvents.ContainsKey(EventID))
        {
            _logger.Debug("Received Unhandled event: " + EventID);
            return;
        }
        _registeredEvents[EventID].Invoke(userSocket, payload, socketHandler);
    }

    public static void RegisterAllEvents()
    {
        _logger.Info("------- Registering SocketEvents --------");
        var methods = Assembly.GetExecutingAssembly().GetTypes()
                      .SelectMany(t => t.GetMethods())
                      .Where(m => m.IsDefined(typeof(SocketEventAttribute), false))
                      .ToArray();
        foreach (var method in methods)
        {
            var attr = method.GetCustomAttribute<SocketEventAttribute>()!;
            if (!method.IsStatic)
            {
                _logger.Warn("Registered SocketEvent : " + attr.EventID + " must be used on static method! Omitting.");
                continue;
            }

            // Check for reserved events
            if (attr.EventID == "CloseEvent")
            {
                _logger.Warn("SocketEvent CloseEvent is internally reserved, please use another name! Omitting.");
                continue;
            }

            try
            {
                SocketEvent newEvent = ((SocketEvent)
                    Delegate.CreateDelegate(typeof(SocketEvent), method));

                if (_registeredEvents.ContainsKey(attr.EventID))
                {
                    _logger.Error("SocketEvent" + attr.EventID + " is duplicated! Only one will work");
                    continue;
                }
                else
                {
                    _registeredEvents.Add(attr.EventID, newEvent);
                    _logger.Info("Registered SocketEvent: " + attr.EventID);
                }
            }
            catch (ArgumentException)
            {
                _logger.Warn("Registered SocketEvent : " + attr.EventID +
                " does not match Task SocketEvent(UserSocket user, string payload, ServerSocketHandler handler) signature. Omitting");
                continue;
            }


        }

        // Register on connection lost events!
        RegisterOnConnectionLostEvents();

        _logger.Info("---- Registered all SocketEvents! ----");
    }


    public static void NotifyOnConnectionLost(string dc_user)
    {
        foreach (var eventHandler in _onConnectionLostEvents)
        {
            eventHandler.Invoke(dc_user);
        }
    }

    private static void RegisterOnConnectionLostEvents()
    {
        var methods = Assembly.GetExecutingAssembly().GetTypes()
                      .SelectMany(t => t.GetMethods())
                      .Where(m => m.IsDefined(typeof(OnSocketConnectionLostAttribute), false))
                      .ToArray();

        foreach (var method in methods)
        {
            if (!method.IsStatic)
            {
                _logger.Warn("Registered onSocketConnectionLost event method: " + method.Name + " must be used on static method! Omitting.");
                continue;
            }

            try
            {
                OnSocketConnectionLostEvent newEvent = ((OnSocketConnectionLostEvent)
                    Delegate.CreateDelegate(typeof(OnSocketConnectionLostEvent), method));


                _onConnectionLostEvents.Add(newEvent);
                _logger.Info("Registered OnSocketConnectionLostEvent: " + method.Name);

            }
            catch (ArgumentException)
            {
                _logger.Warn("Registered OnSocketConnectionLostEvent method : " + method.Name +
                " does not match OnSocketConnectionLostEvent signature. Omitting");
                continue;
            }


        }
    }
}
