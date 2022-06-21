
export function HOSTURL() {
  // override for testing
  return "localhost:7105";
  // return window.location.host;
}

export function HTTPSHOST() {
  return "https://" + HOSTURL();
}

export function WSSHOST() {
  return "wss://" + HOSTURL();
}

