using Microsoft.Extensions.FileProviders;
using NLog;
using NLog.Web;
bool useSwaggerAPIEndpoint = true;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    WebRootPath = "../static",
    Args = args
});

// setup logging
LogManager.Setup().LoadConfigurationFromAppSettings();

if (useSwaggerAPIEndpoint)
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}


// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

Console.WriteLine($"ContentRoot Path: {builder.Environment.ContentRootPath}");
Console.WriteLine($"WebRootPath: {builder.Environment.WebRootPath}");

/* Not neccesary basic things */


if (useSwaggerAPIEndpoint && app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// If Redirection is required
//app.UseHttpsRedirection();

// If Authorization is required
// app.UseAuthorization();

// Configure WebSockets
app.UseWebSockets();

// make it so that it serves default files
app.UseDefaultFiles();

// Make it so it serves static files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, "../static")),
    RequestPath = ""
});


app.MapControllers();

// Register SocketEvents
MonopolyClone.Events.SocketsEventHandler.RegisterAllEvents();

app.Run();

