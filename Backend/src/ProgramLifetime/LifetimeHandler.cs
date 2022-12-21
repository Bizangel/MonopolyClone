using MonopolyClone.Database.Models;
using MonopolyClone.Game;
using MonopolyClone.Json;
using NLog;

public class LifetimeHandlerService : IHostedService
{
    private readonly string MonopolyStatePath = "./monopolystate.json";
    private readonly Logger _logger;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    // this basically requests the IHostApplicationLifetime to be injected via DI
    // public LifetimeHandlerService(
    //     IHostApplicationLifetime hostApplicationLifetime)
    //     => _hostApplicationLifetime = hostApplicationLifetime;

    public LifetimeHandlerService(IHostApplicationLifetime hostApplicationLifetime)
    {
        _hostApplicationLifetime = hostApplicationLifetime;
        _logger = LogManager.GetCurrentClassLogger();
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _hostApplicationLifetime.ApplicationStarted.Register(OnStarted);
        _hostApplicationLifetime.ApplicationStopping.Register(OnStopping);
        _hostApplicationLifetime.ApplicationStopped.Register(OnStopped);

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
        => Task.CompletedTask;

    private void OnStarted()
    {
        try
        {
            var state = System.IO.File.ReadAllText(MonopolyStatePath);
            var storedstate = MonopolySerializer.Deserialize<GameState>(state);
            if (storedstate == null)
                throw new ArgumentException("Invalid state!");

            if (storedstate.players.Count() == 0)
                MonopolyGame.Instance.GoToLobby();
            else
                MonopolyGame.Instance.LoadSavedGame(storedstate);
        }
        catch (Exception ex) when (
            ex is FileNotFoundException ||
            ex is Newtonsoft.Json.JsonException ||
            ex is ArgumentException
            )
        {
            // no file found, or invalid one, so no previous game exists.
            // Set to lobby.
            MonopolyGame.Instance.GoToLobby();
        }
    }

    private void OnStopping()
    {
        var jsonstate = MonopolySerializer.Serialize(MonopolyGame.Instance.GameState);
        using (StreamWriter outputFile = new StreamWriter(MonopolyStatePath))
        {
            outputFile.WriteLine(jsonstate);
        }
    }

    private void OnStopped()
    {
    }
}