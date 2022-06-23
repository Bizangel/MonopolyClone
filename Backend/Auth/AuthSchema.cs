namespace MonopolyClone.Auth;

public class AuthSchema
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class CookieHolder {
    public string AuthenticatedUser { get; set; } = "";
    public long ExpiryTimestamp { get; set; }
}

public class LoginReply
{
    public bool Sucess { get; set; }
}

public class RegisterReply
{
    public bool? Success { get; set; }

    public string? Message { get; set; }
}