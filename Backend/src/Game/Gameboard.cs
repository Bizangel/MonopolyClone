
using MonopolyClone.Database.Models;
using MonopolyClone.Json;
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

    // private GameTile[] _tiles;

    private GameboardTileCollection _tileCollection;

    public GameBoard()
    {
        _logger = LogManager.GetCurrentClassLogger();
        // _tiles = new GameTile[0];
        // read from tiles.json
        var jsonstring = System.IO.File.ReadAllText("gamedata/tiles.jsonc");
        var storedstate = MonopolySerializer.Deserialize<GameboardTileCollection>(jsonstring);

        if (storedstate == null)
            throw new ArgumentException("Could not parse json, stored state is None");

        _tileCollection = storedstate;
    }


    public void Debug()
    {
        _logger.Debug("Here in debug" + _tileCollection.tiles[0].effect);
    }

    public GameboardTileCollection TileCollection => _tileCollection;




}