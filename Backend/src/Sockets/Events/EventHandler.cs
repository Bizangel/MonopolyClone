using System.CodeDom.Compiler;
using System.Reflection;
using System.Text.Json;
using MonopolyClone.Sockets;
using NLog;

namespace MonopolyClone.Events;

public delegate void OnSocketConnectionLostEvent(string dc_user);

public static class SocketsEventHandler
{
    private static readonly Logger _logger;
    private static Dictionary<string, MethodInfo> _registeredEvents;
    private static Dictionary<string, Type> _registeredEventTypes;
    private static List<OnSocketConnectionLostEvent> _onConnectionLostEvents;

    static SocketsEventHandler()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _registeredEvents = new Dictionary<string, MethodInfo>();
        _registeredEventTypes = new Dictionary<string, Type>();
        _onConnectionLostEvents = new List<OnSocketConnectionLostEvent>();
    }

    public static void HandleEvent(string EventID, UserSocket userSocket, string payload, ServerSocketHandler socketHandler)
    {
        if (!_registeredEvents.ContainsKey(EventID))
        {
            _logger.Debug("Received Unhandled event: " + EventID);
            return;
        }

        var payloadType = _registeredEventTypes[EventID];
        if (payloadType == null)
        {
            _logger.Debug("Received event without any typing: " + EventID);
            return;
        }

        try
        {
            _logger.Debug("Deserializing: " + payload);
            var payloadIn = JsonSerializer.Deserialize(payload, payloadType);
            _logger.Debug("payload name: " + payloadType.Name);
            if (payloadIn == null)
                throw new ArgumentException("Invalid Signature.");

            _registeredEvents[EventID].Invoke(null, new object[] { userSocket, socketHandler, payloadIn });
        }
        catch
        {
            _logger.Debug("Received corrupted event payload: ", payload);
        }
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
                // get type of event payload
                Type payloadType = method.GetParameters()[2].ParameterType;

                if (!payloadType.IsSerializable)
                    throw new ArgumentException("Payload type must be serializable!");

                if (method.GetParameters()[0].ParameterType != typeof(UserSocket) ||
                    method.GetParameters()[1].ParameterType != typeof(ServerSocketHandler)
                )
                    throw new ArgumentException("Invalid Signature"); // invalid

                if (_registeredEvents.ContainsKey(attr.EventID))
                {
                    _logger.Error("SocketEvent" + attr.EventID + " is duplicated! Only one will work");
                    continue;
                }
                else
                {
                    _registeredEvents.Add(attr.EventID, method);
                    _registeredEventTypes.Add(attr.EventID, payloadType);
                    _logger.Info("Registered SocketEvent: " + attr.EventID);
                }
            }
            catch (ArgumentException ex)
            {
                _logger.Warn("Registered SocketEvent : " + attr.EventID +
                " does not match Task SocketEvent(UserSocket user, ServerSocketHandler handler, ISerializable payload) signature. "
                + ex.Message + " Omitting");
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
