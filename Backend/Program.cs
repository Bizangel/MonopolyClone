using System.Web;
using Microsoft.Extensions.FileProviders;
using NLog;
using NLog.Web;

bool useSwaggerAPIEndpoint = true;
var DevelopmentOrigin = "_DevelopmentOrigin";
string hostingPath = "../Frontend/build";



var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    WebRootPath = hostingPath,
    Args = args
});


// Add Development CORS for localhost
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: DevelopmentOrigin,
                      policy =>
                      {
                          policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                      });
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

// Add cors on development
if (app.Environment.IsDevelopment())
{
    // allow cors for specific dev origin
    app.UseCors(DevelopmentOrigin);
    Console.WriteLine("Enabling Development CORS for localhost origins");
}


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
           Path.Combine(builder.Environment.ContentRootPath, hostingPath)),
    RequestPath = ""
});


app.MapControllers();

// Register SocketEvents
MonopolyClone.Events.SocketsEventHandler.RegisterAllEvents();

app.Run();

