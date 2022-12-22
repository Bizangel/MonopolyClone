using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using MonopolyClone.DotEnv;
using NLog;
using NLog.Web;

// load env variables
var root = Directory.GetCurrentDirectory();
var dotenv = Path.Combine(root, ".env");
DotEnv.Load(dotenv);

var enableSwagger = Environment.GetEnvironmentVariable("ENABLE_SWAGGER");
bool useSwaggerAPIEndpoint = enableSwagger == "true"; // this way it defaults to false
var DevelopmentOrigin = "_DevelopmentOrigin";

var staticPath = Environment.GetEnvironmentVariable("STATIC_PATH");
if (staticPath == null)
    throw new ArgumentNullException("STATIC_PATH environment variable specifying folder not found! cannot proceed.");



/* Read and set Environment Variables */
var config =
    new ConfigurationBuilder()
        .AddEnvironmentVariables()
        .Build();

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    WebRootPath = staticPath,
    Args = args
});

var developmentCORS = Environment.GetEnvironmentVariable("DEVELOPMENT_CORS");

// Add Development CORS for localhost
if (developmentCORS != null)
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: DevelopmentOrigin,
                        policy =>
                        {
                            policy.WithOrigins(developmentCORS)
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials();
                        });
    });

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
    if (developmentCORS != null)
    {
        app.UseCors(DevelopmentOrigin);
        logger.Warn($"Enabling Development CORS for {developmentCORS}");
    }
    else
        logger.Warn(
            "NO DEVELOPMENT CORS IS PRESENT IN DEVELOPMENT! Login functionalities and similar will NOT work from external sources! (e.g. React development server)" +
            "To set one set the environment variable DEVELOPMENT_CORS");

}


logger.Info($"ContentRoot Path: {builder.Environment.ContentRootPath}");
logger.Info($"WebRootPath: {builder.Environment.WebRootPath}");

/* Not neccesary basic things */


if (useSwaggerAPIEndpoint && app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configure WebSockets
app.UseWebSockets();

app.UseProtectFolder(new ProtectFolderOptions
{
    Path = "/static/media",
    PolicyName = "Authenticated",
});

// make it so that it serves default files
app.UseDefaultFiles();

// Make it so it serves static files
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".glb"] = "model/gltf-buffer";

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, staticPath)),
    RequestPath = "",
    ContentTypeProvider = provider,
});

app.MapControllers();

var pass = MonopolyClone.Lobby.LobbyHandler.Instance.GetLobbyPass();
logger.Info("Generated Lobby password is: " + pass);
logger.Info("Generated Registration password is: " + MonopolyClone.Controllers.AuthenticationController.RegistrationCode);

// Initialize encryptor
MonopolyClone.Auth.CryptTools.AesEncryptor.Initialize();

// Register SocketEvents
MonopolyClone.Events.SocketsEventHandler.RegisterAllEvents();

app.Run();

