

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

/* Not neccesary basic things */

// If Redirection is required
//app.UseHttpsRedirection();

// If Authorization is required
// app.UseAuthorization();

// Configure WebSockets
app.UseWebSockets();

// make it so that it serves default files
app.UseDefaultFiles();

// Make it so it serves static files
app.UseStaticFiles();

app.MapControllers();

app.Run();
