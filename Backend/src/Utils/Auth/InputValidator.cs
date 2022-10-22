using System;
using System.Text.RegularExpressions;

namespace MonopolyClone.Auth.Validator;


public static class InputValidator {
    public static int MaxUsernameLength = 20;
    public static int MinUsernameLength = 3;

    private static Regex _usernameValidator;

    static InputValidator(){
        _usernameValidator = new Regex("^[a-zA-Z0-9]*$", RegexOptions.None, TimeSpan.FromMilliseconds(10));
    }

    /// <summary>
    /// Checks whether the username string is a valid username string. Not too long and short, and no special characters.
    /// </summary>
    /// <param name="username">The username to check against</param>
    /// <returns>A tuple indicating the success and the message, respectively.</returns>
    public static Tuple<bool, string> ValidateUsername(string username) {
   
        if (username.Length > MaxUsernameLength) 
            return new Tuple<bool, string>(false, "Username is too long!");
        

        if (username.Length < MinUsernameLength)
            return new Tuple<bool, string>(false, "Username is too short!");

        bool success;
        string msg;
        try {
            if (_usernameValidator.IsMatch(username))
            {
                success = true;
                msg = "Success!";
            }
            else {
                success = false;
                msg = "Username cannot contain special characters!";
            }
        }
        catch (Exception){
            success = false;
            msg = "Invalid username.";
        }

        return new Tuple<bool, string>(success, msg);
    }
}