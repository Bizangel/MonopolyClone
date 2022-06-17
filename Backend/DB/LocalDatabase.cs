using LiteDB;

using MonopolyClone.Database.Models;

namespace MonopolyClone.Database;


public static class LocalDatabase
{
    // Name configurations
    private static readonly string _database_path = "monopolyclone.db";
    private static readonly string _user_collection_name = "Users";
    private static LiteDatabase _database_instance;
    private static ILiteCollection<User> _user_collection;

    static LocalDatabase()
    {
        _database_instance = new LiteDatabase(_database_path);
        _user_collection = _database_instance.GetCollection<User>(_user_collection_name);
    }


    public static void InsertUser(string username, string passwordhash)
    {

        var newUser = new User() { Username = username, PasswordHash = passwordhash };
        _user_collection.Insert(newUser);
        _user_collection.EnsureIndex(x => x.Username);
    }

    public static bool UserExists(string UserName)
    {
        return _user_collection.Exists(Query.EQ("Username", UserName));
    }

    public static string GetUserHash(string UserName)
    {
        var res = _user_collection.Query().Where(x => x.Username == UserName).Single();

        if (res == null)
        {
            Console.WriteLine("ERROR. Requested non-existing user hash.");
            return "XXX";
        }

        return res.PasswordHash!;
    }

}