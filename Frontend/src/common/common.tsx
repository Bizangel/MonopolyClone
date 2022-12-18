import moneyimg from "assets/moneysprite_small.png"
import houseimg from "assets/character_sprites/housesprite.png";
import transportimg from "assets/character_sprites/transportsprite.png";
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

export function MoneyImgTag() {
  return (
    <img className="rounded float-left img-fluid mw-100 mh-100"
      style={{ width: "20px", height: "10px" }}
      src={moneyimg} alt="" ></img>
  )
}


export function HouseImgTag() {
  return (
    <img className="rounded float-left img-fluid mw-100 mh-100"
      style={{ width: "20px", height: "20px" }}
      src={houseimg} alt="" ></img>
  )
}


export function TransportImgTag() {
  return (
    <img className="rounded float-left img-fluid mw-100 mh-100"
      style={{ width: "20px", height: "20px" }}
      src={transportimg} alt="" ></img>
  )
}