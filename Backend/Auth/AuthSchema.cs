namespace MonopolyClone.Auth;

public class AuthSchema
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class GamePlayTicket
{
    public bool? IsValidTicket { get; set; }

    public string? TicketHolderUsername { get; set; }

    public string? TicketSecret { get; set; }
}

public class RegisterReply
{
    public bool? Success { get; set; }

    public string? Message { get; set; }
}