using System.CodeDom.Compiler;
using System.Reflection;
using NLog;

namespace MonopolyClone.Events;


public static class SocketsEventHandler
{
    private static readonly Logger _logger;
    private static Dictionary<string, Action<string, string>> _registeredEvents;

    static SocketsEventHandler()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _registeredEvents = new Dictionary<string, Action<string, string>>();
    }

    public static void HandleEvent(string EventID, string username, string payload)
    {
        if (!_registeredEvents.ContainsKey(EventID))
        {
            _logger.Debug("Received Unhandled event: " + EventID);
            return;

        }
        _registeredEvents[EventID].Invoke(username, payload);
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

            try
            {
                Action<string, string> newEvent = (Action<string, string>)Delegate.CreateDelegate(typeof(Action<string, string>), method);

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
                _logger.Warn("Registered SocketEvent : " + attr.EventID + " does not match Event(string user, string payload) signature. Omitting");
                continue;
            }


        }

        _logger.Info("---- Registered all SocketEvents! ----");
    }
}
