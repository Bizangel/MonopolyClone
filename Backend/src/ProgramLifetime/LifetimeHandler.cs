public class LifetimeHandlerService : IHostedService
{
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    // this basically requests the IHostApplicationLifetime to be injected via DI
    public LifetimeHandlerService(
        IHostApplicationLifetime hostApplicationLifetime)
        => _hostApplicationLifetime = hostApplicationLifetime;

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
        // ...
        Console.WriteLine("Started");
    }

    private void OnStopping()
    {
        // ...
        Console.WriteLine("stopping");
    }

    private void OnStopped()
    {
        // ...
        Console.WriteLine("stopped");
    }
}