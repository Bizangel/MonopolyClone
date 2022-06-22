using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using MonopolyClone.Auth;
using MonopolyClone.Auth.Validator;
using MonopolyClone.Database;
using NLog;

namespace MonopolyClone.Controllers;

[ApiController]
[Route("/")]
public class AuthenticationController : ControllerBase
{
    private static AuthenticationController? _instance;

    private Dictionary<string, GamePlayTicket> _userTickets;
    private Dictionary<string, string> _tickets2user;
    private readonly Logger _logger;
    private readonly IWebHostEnvironment _environment;

    public AuthenticationController(IWebHostEnvironment environment)
    {
        _userTickets = new Dictionary<string, GamePlayTicket>();
        _tickets2user = new Dictionary<string, string>();
        _instance = this;
        _logger = LogManager.GetCurrentClassLogger();
        _environment = environment;
    }

    [HttpPost("RegisterAccount")]
    public RegisterReply RegisterAccount(AuthSchema auth)
    {
        // Validate that they're not null
        if (auth.Username == null || auth.Password == null)
            return new RegisterReply()
            {
                Success = false,
                Message = "Username and Password must be given!"
            };

        // Validate the username value itself.
        var validator_resp = InputValidator.ValidateUsername(auth.Username);
        if (!validator_resp.Item1)
            return new RegisterReply() { Success = false, Message = validator_resp.Item2 };

        // Check that username doesn't already exist
        if (LocalDatabase.UserExists(auth.Username))
            return new RegisterReply() { Success = false, Message = "User already exists!" };

        // Validate that password is at least 3 characters
        if (auth.Password.Length < 3)
            return new RegisterReply() { Success = false, Message = "Password is too short!" };

        // If passed all validations, then actually store
        try
        {
            string Hash = BCrypt.Net.BCrypt.HashPassword(auth.Password);
            LocalDatabase.InsertUser(auth.Username, Hash);
        }
        catch (Exception)
        {
            return new RegisterReply() { Success = false, Message = "Cannot register with such password" };
        }

        _logger.Info($"New User {auth.Username} registered!");

        return new RegisterReply() { Success = true, Message = "Successfully registered!" };
    }

    [HttpPost("RequestGameTicket")]
    public GamePlayTicket GetGamePlayTicket(AuthSchema auth)
    {



        // validate that they're not null
        if (auth.Username == null || auth.Password == null)
        {
            return new GamePlayTicket()
            {
                IsValidTicket = false,
            };
        }
        // Handle Login
        if (!LocalDatabase.UserExists(auth.Username))
            return new GamePlayTicket()
            {
                IsValidTicket = false,
            };

        string hash = LocalDatabase.GetUserHash(auth.Username);

        bool isValidHash = BCrypt.Net.BCrypt.Verify(auth.Password, hash);

        if (!isValidHash)
            return new GamePlayTicket()
            {
                IsValidTicket = false,
            };

        string ticketSecret = Auth.SecretGenerator.SecretGenerator.GetUniqueSecret(20);
        var newTicket = new GamePlayTicket() { IsValidTicket = true, TicketHolderUsername = auth.Username, TicketSecret = ticketSecret };

        var cookieOptions = new CookieOptions
        {
            Secure = true,
            SameSite = SameSiteMode.Strict,
            HttpOnly = true,
            Domain = null,
            Expires = DateTime.UtcNow.AddDays(1),
            IsEssential = true,
        };


        Response.Cookies.Append("Mycookie","value", cookieOptions);

        _logger.Info($"User {auth.Username} logged in at {DateTime.Now}");

        // create new ticket, or simply replace old ticket.
        _userTickets.Add(auth.Username, newTicket);
        _tickets2user.Add(newTicket.TicketSecret, auth.Username);
        return newTicket;
    }
        
    public static bool ValidateUserTicketSecret(string username, string ticketSecret)
    {
        if (_instance != null)
            if (_instance._userTickets.ContainsKey(username))
                return _instance._userTickets[username].TicketSecret == ticketSecret;

        return false;
    }

    public static bool IsValidSecret(string ticketSecret)
    {
        if (_instance != null)
            return _instance._tickets2user.ContainsKey(ticketSecret);


        return false;
    }

    public static string? GetUsernameFromSecret(string username)
    {
        if (_instance != null)
            if (_instance._tickets2user.ContainsKey(username))
                return _instance._tickets2user[username];

        return null;
    }
}
