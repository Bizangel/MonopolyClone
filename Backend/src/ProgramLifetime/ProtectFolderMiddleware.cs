using Microsoft.AspNetCore.Authorization;
using MonopolyClone.Auth;
using MonopolyClone.Auth.CryptTools;
using MonopolyClone.Json;

// Adapted from: https://odetocode.com/blogs/scott/archive/2015/10/06/authorization-policies-and-middleware-in-asp-net-5.aspx

public class ProtectFolderOptions
{
    public PathString Path { get; set; }
    public string PolicyName { get; set; } = "";
}

public class ProtectFolder
{
    private readonly RequestDelegate _next;
    private readonly PathString _path;
    private readonly string _policyName;

    public ProtectFolder(RequestDelegate next, ProtectFolderOptions options)
    {
        _next = next;
        _path = options.Path;
        _policyName = options.PolicyName;
    }

    public async Task Invoke(HttpContext httpContext,
                             IAuthorizationService authorizationService)
    {
        if (httpContext.Request.Path.StartsWithSegments(_path))
        {
            // verify auth
            string? authCookie = httpContext.Request.Cookies["Auth"];
            if (authCookie == null)
            {
                httpContext.Response.StatusCode = 403;
                return;
            }

            CookieHolder? holder = null;
            try
            {
                holder = MonopolySerializer.Deserialize<CookieHolder>(AesEncryptor.Instance.Decrypt(authCookie));
            }
            catch (Exception) // any exception. Due to encryption etc
            {
                httpContext.Response.StatusCode = 403;
                return;
            }

            if (holder == null)
            {
                httpContext.Response.StatusCode = 403;
                return;
            }

            if (!VerifyCookieTime(holder))
            {
                httpContext.Response.StatusCode = 403;
                return;
            }

            // cookie is valid so let him thru
        }

        await _next(httpContext);
    }

    private static bool VerifyCookieTime(CookieHolder holder)
    {
        return holder.ExpiryTimestamp > ((DateTimeOffset)DateTime.Now).ToUnixTimeSeconds();
    }
}

public static class ProtectFolderExtensions
{
    public static IApplicationBuilder UseProtectFolder(
        this IApplicationBuilder builder,
        ProtectFolderOptions options)
    {
        return builder.UseMiddleware<ProtectFolder>(options);
    }
}