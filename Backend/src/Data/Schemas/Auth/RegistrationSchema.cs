namespace MonopolyClone.Auth;

public class RegistrationSchema
{
    public string? Username { get; init; }
    public string? Password { get; init; }
    public string? RegistrationTemporaryPasssword { get; init; }
}