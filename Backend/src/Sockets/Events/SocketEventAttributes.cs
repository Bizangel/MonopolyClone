namespace MonopolyClone.Events;

[AttributeUsage(AttributeTargets.Method, Inherited = false, AllowMultiple = false)]
public class SocketEventAttribute : Attribute
{
    private string _eventid;

    public SocketEventAttribute(string EventID)
    {
        _eventid = EventID;
    }

    public virtual string EventID { get { return _eventid; } }
}

[AttributeUsage(AttributeTargets.Method, Inherited = false, AllowMultiple = false)]
public class OnSocketConnectionLostAttribute : Attribute
{
    public OnSocketConnectionLostAttribute()
    {
    }
}