using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using MonopolyClone.Auth;
using MonopolyClone.Auth.Validator;
using MonopolyClone.Auth.CryptTools;
using MonopolyClone.Database;
using System.Text.Json;
using NLog;

namespace MonopolyClone.Controllers;

[ApiController]
[Route("/")]
public class AuthenticationController : ControllerBase
{
    private const double cookie_expiry_days = 2;
    private static AuthenticationController? _instance;
    private readonly Logger _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly AesEncryptor _aesEncryptor;
    public AuthenticationController(IWebHostEnvironment environment)
    {
        _instance = this;
        _logger = LogManager.GetCurrentClassLogger();
        _environment = environment;
        _aesEncryptor = new AesEncryptor();
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

    [HttpPost("Login")]
    public LoginReply GetGamePlayTicket(AuthSchema auth)
    {
        // validate that they're not null
        if (auth.Username == null || auth.Password == null)
        {
            return new LoginReply() { Sucess = false };
        }
        // Handle Login
        if (!LocalDatabase.UserExists(auth.Username))
            return new LoginReply() { Sucess = false };

        string hash = LocalDatabase.GetUserHash(auth.Username);

        bool isValidHash = BCrypt.Net.BCrypt.Verify(auth.Password, hash);

        if (!isValidHash)
            return new LoginReply() { Sucess = false };

        var cookieOptions = new CookieOptions
        {
            Secure = true,
            SameSite = SameSiteMode.Strict,
            HttpOnly = true,
            Domain = null,
            Expires = DateTime.UtcNow.AddDays(cookie_expiry_days),
            IsEssential = true,
        };


        long unixTime = ((DateTimeOffset)DateTime.Now.AddDays(cookie_expiry_days)).ToUnixTimeSeconds();
        string? cookiestring = null;
        try
        {
            cookiestring = _aesEncryptor.Encrypt(JsonSerializer.Serialize(new CookieHolder() { AuthenticatedUser = auth.Username, ExpiryTimestamp = unixTime }));
        }
        catch (Exception e) {
            _logger.Error($"Error serializing and encrypting {auth.Username} {auth.Password}:" + e.Message);
            return new LoginReply() { Sucess = false };
        }

        // Add cookie response and headers
        Response.Cookies.Append("Auth", cookiestring, cookieOptions);
        _logger.Info($"User {auth.Username} logged in at {DateTime.Now}");

        return new LoginReply() { Sucess = true };
    }
}
