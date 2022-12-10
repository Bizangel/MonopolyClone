namespace MonopolyClone.Auth;

public class CookieHolder
{
    public string AuthenticatedUser { get; init; } = "";
    public long ExpiryTimestamp { get; init; }
}
