using System.Web;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using MonopolyClone.DotEnv;
using NLog;
using NLog.Web;


bool useSwaggerAPIEndpoint = true;
var DevelopmentOrigin = "_DevelopmentOrigin";
string hostingPath = "../Frontend/build";


var root = Directory.GetCurrentDirectory();
var dotenv = Path.Combine(root, ".env");
DotEnv.Load(dotenv);

/* Read and set Environment Variables */
var config =
    new ConfigurationBuilder()
        .AddEnvironmentVariables()
        .Build();

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
                          //policy.SetIsOriginAllowed(origin => {
                          //    var hostName = new Uri(origin).Host;
                          //    if (hostName == "localhost") { return true; }
                          //    if (hostName.StartsWith("192.168.1.")) { return true; }
                          //    return false;
                          //    })
                          //  .AllowAnyHeader()
                          //  .AllowAnyMethod();
                          policy.WithOrigins("https://192.168.0.69:3000", "https://192.168.0.69")
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                      });
});


// add cookie-based authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();
builder.Services.AddHostedService<LifetimeHandlerService>();



// setup logging
var logger = LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();

if (useSwaggerAPIEndpoint) { logger.Info("Enabling Swagger API explorer!"); }


if (useSwaggerAPIEndpoint)
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

// Add services to the container.
builder.Services.AddControllers();


var app = builder.Build();

if (app.Environment.IsDevelopment()) { logger.Warn("Warning: Running on DEVELOPMENT environment!"); }
if (app.Environment.IsProduction()) { logger.Info("Running production environment!"); }

// Add cors on development
if (app.Environment.IsDevelopment())
{
    // allow cors for specific dev origin
    app.UseCors(DevelopmentOrigin);
    logger.Warn("Enabling Development CORS for localhost origins");
}


logger.Info($"ContentRoot Path: {builder.Environment.ContentRootPath}");
logger.Info($"WebRootPath: {builder.Environment.WebRootPath}");

/* Not neccesary basic things */


if (useSwaggerAPIEndpoint && app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// Use authentication (for cookies!)
app.UseAuthentication();

// If Redirection is required
//app.UseHttpsRedirection();

// If Authorization is required, authorization is done kind of manually and not using middlewares so not used ATM.
//app.UseAuthorization();

// Configure WebSockets
app.UseWebSockets();

// make it so that it serves default files
app.UseDefaultFiles();

// Make it so it serves static files

var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".glb"] = "model/gltf-buffer";

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, hostingPath)),
    RequestPath = "",
    ContentTypeProvider = provider,
});


app.MapControllers();

var pass = MonopolyClone.Lobby.LobbyHandler.Instance.GetLobbyPass();
logger.Info("Generated Lobby password is: " + pass);

// Register SocketEvents
MonopolyClone.Events.SocketsEventHandler.RegisterAllEvents();

app.Run();

