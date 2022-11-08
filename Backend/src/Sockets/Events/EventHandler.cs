using System.Reflection;
using System.Text.Json;
using MonopolyClone.Game;
using MonopolyClone.Sockets;
using NLog;
namespace MonopolyClone.Events;

/*
Because of the need of multiple implementation details, this class kind of grew a little bit out of hand.
So much that I've decided to summarize it and explain little details here for me in the future.

This class is effectively an event handler as the name summarizes. It intends to give a nice easy to use interface,
kind of similar like SocketIO, although with maybe more boilerplate I guess.

The whole premise is that the server will receive events from the user, with a random payload.
This event handler will:

- Identify the user, and give the necessary information to be used inside the event handlers.
- Identify the proper associated event handler.
- Verify that the payload is valid to the expected payload of the event handler.
This can be any serializable class that the EventHandler decides to use.
- Call the proper event handlers when events happens.
- Give the proper hooks to emit information to every user as well as the specified user.

This works and plays rather nicely. To create a new event handler,
simply create a static method *anywhere* that matches the specified signature and mark it with the attribute.

However, to add more room for play, this concept of "labels" of event handlers was created.
This pretty much effectively creates multiple virtual instances of the event handlers that can be switched *on-the-fly*

So for example if the event `state-update` is associated to the EventLabel is default.
Then the game must be listening to the types of default events so the handler is called.
Else it will be totally ignored.

This switching can be done on the fly on runtime.
And to specify the label it's necessary to use the required attributes.

Additionally, it is important to note that events will still be requiring the proper payload and types.
And will be expected to be unique. This means that two events with same IDs can never exist, even if in different labels.

The purpose of labels was to filter out events according to the context, not to create multiple instances or similar.

Additionally it also provides with interffaces for on SocketClose and SocketOpen event.
However these don't have IDs and their system is totally independent from the label system, and will always be called regardless.
*/


class InvalidPayloadException : Exception
{
    public InvalidPayloadException() { }
    public InvalidPayloadException(string name) : base(String.Format("Invalid payload: {0}", name)) { }
};

public delegate Task OnSocketConnectionLostEvent(string dc_user, ServerSocketHandler handler);
public delegate Task OnSocketConnectEvent(UserSocket user, ServerSocketHandler handler);

public static class SocketsEventHandler
{
    private static readonly Logger _logger;

    private static HashSet<String> _registeredEventsIDs;
    private static Dictionary<EventLabel, Dictionary<string, MethodInfo>> _registeredEvents;
    private static Dictionary<string, Type> _registeredEventTypes;
    private static List<OnSocketConnectionLostEvent> _onConnectionLostEvents;
    private static List<OnSocketConnectEvent> _onConnectionEvents;

    static SocketsEventHandler()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _registeredEvents = new Dictionary<EventLabel, Dictionary<string, MethodInfo>>();
        _registeredEventTypes = new Dictionary<string, Type>();
        _onConnectionEvents = new List<OnSocketConnectEvent>();
        _onConnectionLostEvents = new List<OnSocketConnectionLostEvent>();
        _registeredEventsIDs = new HashSet<string>();
    }

    public static async void HandleEvent(string EventID, UserSocket userSocket, string payload, ServerSocketHandler socketHandler)
    {
        if (!_registeredEventsIDs.Contains(EventID))
        {
            _logger.Debug("Received Unhandled event: " + EventID);
            return;
        }

        var payloadType = _registeredEventTypes[EventID];
        if (payloadType == null)
        {
            _logger.Error("Received event without any typing: " + EventID);
            return;
        }

        var currentHandler = _registeredEvents[MonopolyGame.Instance.ListeningEventLabel];

        if (!currentHandler.ContainsKey(EventID))
        {
            _logger.Debug($"Event ID: {EventID} will be ignored due to label filtering.");
            return;
        }

        object? payloadIn = null;
        try
        {
            payloadIn = JsonSerializer.Deserialize(payload, payloadType);

            if (payloadIn == null)
                throw new ArgumentException("Invalid Signature.");
        }
        catch (Exception)
        {
            // if this happens in prod, event is discarded.
            _logger.Debug("Received corrupted event payload: " + payload);
        }


        if (payloadIn != null)
        {
            try
            {
                var handlertask = (Task?)currentHandler[EventID].Invoke(null, new object[] { userSocket, socketHandler, payloadIn });
                if (handlertask != null) // this is typecheck, but this should never happen.
                {
                    await handlertask;
                }

            }
            catch (TargetInvocationException ex)
            {
                if (ex.InnerException is InvalidPayloadException)
                {
                    _logger.Debug("Received corrupted event payload: " + payload + " " + ex.InnerException.Message);
                }
                else
                {
                    throw ex;
                }
            }
        }
    }

    public static void RegisterAllEvents()
    {
        _logger.Debug("------- Registering SocketEvents --------");
        // initialize an empty dict for ALL enum labels.
        foreach (EventLabel label in Enum.GetValues(typeof(EventLabel)))
        {
            _registeredEvents.Add(label, new Dictionary<string, MethodInfo>());
        }

        var methods = Assembly.GetExecutingAssembly().GetTypes()
                      .SelectMany(t => t.GetMethods())
                      .Where(m => m.IsDefined(typeof(SocketEventAttribute), false))
                      .ToArray();
        foreach (var method in methods)
        {
            // find it's specified label, if not defined, then use default
            var label = EventLabel.Default;
            if (method.IsDefined(typeof(SocketEventLabelAttribute), true)) // use another one if specified
            {
                label = method.GetCustomAttribute<SocketEventLabelAttribute>()!.Label;
            }

            var thisLabelHandler = _registeredEvents[label];

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
                    method.GetParameters()[1].ParameterType != typeof(ServerSocketHandler) ||
                    method.ReturnType != typeof(Task)
                )
                    throw new ArgumentException("Invalid Signature"); // invalid

                if (_registeredEventsIDs.Contains(attr.EventID))
                {
                    _logger.Error("SocketEvent" + attr.EventID + " is duplicated! Only one will work");
                    continue;
                }
                else
                {
                    _registeredEventsIDs.Add(attr.EventID);
                    thisLabelHandler.Add(attr.EventID, method);
                    _registeredEventTypes.Add(attr.EventID, payloadType);
                    _logger.Debug("Registered SocketEvent: " + attr.EventID);
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

        // Register on connect events
        RegisterOnConnectEvents();
        // Register on connection lost events!
        RegisterOnConnectionLostEvents();


        _logger.Info("---- Registered all SocketEvents! ----");
    }


    public static async Task NotifyNewConnection(UserSocket new_user, ServerSocketHandler handler)
    {
        foreach (var eventHandler in _onConnectionEvents)
        {
            await eventHandler.Invoke(new_user, handler);
        }
    }

    public static void NotifyOnConnectionLost(string dc_user, ServerSocketHandler handler)
    {
        foreach (var eventHandler in _onConnectionLostEvents)
        {
            eventHandler.Invoke(dc_user, handler);
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
                _logger.Debug("Registered OnSocketConnectionLostEvent: " + method.Name);

            }
            catch (ArgumentException)
            {
                _logger.Warn("Registered OnSocketConnectionLostEvent method : " + method.Name +
                " does not match OnSocketConnectionLostEvent signature. Omitting");
                continue;
            }


        }
    }


    private static void RegisterOnConnectEvents()
    {
        var methods = Assembly.GetExecutingAssembly().GetTypes()
                      .SelectMany(t => t.GetMethods())
                      .Where(m => m.IsDefined(typeof(OnSocketConnectAttribute), false))
                      .ToArray();

        foreach (var method in methods)
        {
            if (!method.IsStatic)
            {
                _logger.Warn("Registered onSocketConnect event method: " + method.Name + " must be used on static method! Omitting.");
                continue;
            }

            try
            {
                OnSocketConnectEvent newEvent = ((OnSocketConnectEvent)
                    Delegate.CreateDelegate(typeof(OnSocketConnectEvent), method));


                _onConnectionEvents.Add(newEvent);
                _logger.Debug("Registered OnSocketConnectEvent: " + method.Name);

            }
            catch (ArgumentException)
            {
                _logger.Warn("Registered OnSocketConnectEvent method : " + method.Name +
                " does not match OnSocketConnectEvent signature. Omitting");
                continue;
            }
        }
    }
}
