namespace MonopolyClone.Auth;


public class CookieHolder
{
    required public string AuthenticatedUser { get; set; }
    required public long ExpiryTimestamp { get; set; }
}
