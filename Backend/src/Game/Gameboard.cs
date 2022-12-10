
using MonopolyClone.Database.Models;
using Newtonsoft.Json;
using NLog;
namespace MonopolyClone.Game;


/// <summary>
/// Gameboard Class. Holds STATIC board information.
/// This is generated on startup and it is intended to not be modified.
/// Things like property value, images, names, etc.
/// </summary>
public class GameBoard
{
    private Logger _logger;

    private GameTile[] _tiles;

    private GameboardTileCollection _tileCollection;

    public GameBoard()
    {
        _logger = LogManager.GetCurrentClassLogger();
        _tiles = new GameTile[0];
        // read from tiles.json
        var jsonstring = System.IO.File.ReadAllText("gamedata/tiles.json");
        var storedstate = JsonConvert.DeserializeObject<GameboardTileCollection>(jsonstring);

        if (storedstate == null)
            throw new ArgumentException("Could not parse json, stored state is None");

        _tileCollection = storedstate;
    }

    public GameboardTileCollection TileCollection => _tileCollection;




}