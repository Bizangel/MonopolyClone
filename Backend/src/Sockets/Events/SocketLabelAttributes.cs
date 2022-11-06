namespace MonopolyClone.Events;

[AttributeUsage(AttributeTargets.Method, Inherited = false, AllowMultiple = false)]
public class SocketEventLabelAttribute : Attribute
{
    private EventLabel _eventLabel;

    public SocketEventLabelAttribute(EventLabel EventID)
    {
        _eventLabel = EventID;
    }

    public virtual EventLabel Label { get { return _eventLabel; } }
}