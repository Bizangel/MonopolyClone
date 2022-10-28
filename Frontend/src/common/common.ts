export const isDevelopment = process.env.NODE_ENV === "development";

export function HOSTURL() {
  // REMOVE IN PRODUCTION CODE!
  if (isDevelopment)
    return process.env.REACT_APP_DEV_BACKEND_SERVER_URL

  return window.location.host;
}

export function HTTPSHOST() {
  return "https://" + HOSTURL();
}

export function WSSHOST() {
  return "wss://" + HOSTURL();
}

export function readCookie(name: string) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}