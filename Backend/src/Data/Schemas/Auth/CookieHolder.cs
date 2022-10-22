namespace MonopolyClone.Auth;


public class CookieHolder
{
    public string AuthenticatedUser { get; set; } = "";
    public long ExpiryTimestamp { get; set; }
}
