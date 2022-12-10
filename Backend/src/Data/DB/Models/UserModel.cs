
namespace MonopolyClone.Database.Models;

public class User
{
    required public string? Username { get; set; }
    required public string? PasswordHash { get; set; }
}