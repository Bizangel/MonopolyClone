
export function HOSTURL() {
  // REMOVE IN PRODUCTION CODE! 
  return "192.168.1.69:7105";

  // return window.location.host;
}

export function HTTPSHOST() {
  return "https://" + HOSTURL();
}

export function WSSHOST() {
  return "wss://" + HOSTURL();
}

