import { readCookie, WSSHOST } from "common/common";
import { SocketEventMessageSchema } from "schemas";
import { generateID, sleep } from "utils/funcs";

type EventPayload = any;
export type SocketEventCallback = (payload: EventPayload, callback_id: string) => void;
type SocketOpenCloseCallback = (user: UserSocket) => void;

const INTERNAL_RECONNECT_EVENT = "INTERNAL-RECONNECT-EVENT"
const INTERNAL_EVENTS = [INTERNAL_RECONNECT_EVENT];

export enum SocketEventTypes {
  SocketEvent = 0,
  TempEvent = 1,
  OpenEvent = 2,
  CloseEvent = 3,
}

export class UserSocket {
  private reconnectionDelay = 10000;
  private socket?: WebSocket;
  private authenticatedUser: string;
  // maps, event-id > internal_id > callback
  private registeredEvents: Map<string, Map<string, SocketEventCallback>>;
  private onOpenEvents: SocketOpenCloseCallback[];
  private onCloseEvents: SocketOpenCloseCallback[];
  private unauthorizedCallback: () => void;

  public get Username() {
    return this.authenticatedUser;
  }

  constructor() {
    var username = "";

    this.authenticatedUser = username;
    this.registeredEvents = new Map<string, Map<string, SocketEventCallback>>();
    this.onOpenEvents = [];
    this.onCloseEvents = [];

    this.unauthorizedCallback = () => { };
  }

  private onSocketOpen = async () => {
    console.log("socket opened!")
    // socket is open, trigger reconnect event in case anything is waiting
    this.invokeEventHandlers(INTERNAL_RECONNECT_EVENT, "");
    this.onOpenEvents.forEach(callback => callback(this))
  }

  private onSocketClose = () => {
    console.log("socket closed")
    this.onCloseEvents.forEach(callback => callback(this));
  }

  private handleOnMessage = (event: MessageEvent) => {
    var json = null;
    try {
      json = JSON.parse(event.data.toString());
    }
    catch (e) {
      console.log("Error parsing JSON: " + e);
      return;
    }

    var parsed = SocketEventMessageSchema.safeParse(json);
    if (!parsed.success) {
      console.warn("Received invalid event from backend server:", json)
      return;
    }

    // Fire Registered handlers
    this.invokeEventHandlers(parsed.data.EventIdentifier, parsed.data.Payload);
  }

  private onSocketErrorClose = () => {
    this.onSocketClose();
    this.socket = undefined;
    // attempt to reconnect.
    this.attemptEndlessReconnection()
  }

  private handleOnError = (event: Event) => {
    // this will automatically fire handleOnClose
    console.warn("Websockets Errored:")
    this.onSocketErrorClose();
  }

  private onSocketUnauthorized = () => {
    this.onSocketClose();
    this.unauthorizedCallback();
  }

  private handleOnClose = (event: CloseEvent) => {
    console.log("Connection closed, reason: " + event.reason)

    if (event.reason === "Unauthorized") { this.onSocketUnauthorized(); }
    else {  // if not unauthorized, then attempt to try reconnecting
      this.onSocketErrorClose()
    }

  }

  private invokeEventHandlers = (event: string, payload: EventPayload) => {
    const handlers = this.registeredEvents.get(event)
    if (handlers === undefined) {
      if (!INTERNAL_EVENTS.includes(event))
        console.warn(`Received unhandled event: ${event} with payload:`, payload)
      return;
    }

    handlers.forEach((callback, int_id) => { callback(payload, int_id) });
  }

  private attemptEndlessReconnection = async () => {
    while (true) {
      var status = await this.attemptConnect();

      switch (status) {
        case "opened":
          if (this.socket === undefined) {
            throw new Error("Websocket was resolved as open yet undefined")
          }
          this.initializeOpenedSocket(this.socket);
          return;
        case "errored":
          await sleep(this.reconnectionDelay)// await
          continue; // and retry

        case "unauthorized":
          this.unauthorizedCallback() // call event, but no point in trying so leave.
          return;
      }
    }
  }

  private attemptConnect = async () => {
    if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {
      return; // already connected
    }

    var socket = new WebSocket(WSSHOST() + "/ws");
    type resolvedStatus = "opened" | "errored" | "unauthorized";

    var status = new Promise<resolvedStatus>((resolve) => {
      socket.onopen = () => { resolve("opened"); }
      socket.onerror = () => { resolve("errored"); }
      socket.onclose = (event: CloseEvent) => {
        if (event.reason === "Unauthorized") { resolve("unauthorized") }
        else { throw new Error(`Websocket connection was closed. Reason: ${event.reason}`) }
      }
    })

    var resolved = await status;
    console.log("resolved socket: ", resolved)
    if (resolved === "opened" && this.socket === undefined) {
      // read cookie for username
      var username = readCookie("Auth-User");
      if (username === null) {
        throw new Error("At gamepage without auth-user cookie")
      }

      this.authenticatedUser = username;
      this.socket = socket;
      await this.onSocketOpen();
    }

    return resolved;
  }

  private initializeOpenedSocket(socket: WebSocket) {
    if (socket.readyState !== WebSocket.OPEN)
      throw new Error("Received non-opened socket on initializeOpenSocket!")

    this.socket = socket
    this.socket.onmessage = this.handleOnMessage;
    this.socket.onclose = this.handleOnClose;
    this.socket.onerror = this.handleOnError;
  }
  /* Public Api */

  /**
   * Adds an event listener to the socket.
   * @param event The event to listen for.
   * @param callback The callback to call when the event is fired.
   * @returns An ID of the attached callback. Use to remove event listener.
   */
  public on = (event: string, callback: SocketEventCallback): string => {
    var handlers = this.registeredEvents.get(event);
    if (handlers === undefined) {
      handlers = new Map<string, SocketEventCallback>();
    }

    var id = generateID(25);
    handlers.set(id, callback)
    this.registeredEvents.set(event, handlers);
    return id;
  }

  public off(event: string, id: string) {
    var handlers = this.registeredEvents.get(event);
    if (handlers === undefined) {
      console.warn(`Attempted to remove event listener from ${event} without any attached listener.`);
      return;
    }


    var deleted = handlers.delete(id);
    if (!deleted) {
      console.warn(`Attempted to remove event listener from ${event} with id ${id}, but event didn't exist`)
    }
  }

  /**
   * Registers a function to be called when the socket is opened (Is authenticated and able to send and receive events).
   * Internally Opening is called when the socket is opened, but publicly, this is called when the socket is authenticated.
   * @param callback The callback to call when the socket is opened.
   */
  public onReady = (callback: SocketOpenCloseCallback) => {
    this.onOpenEvents.push(callback);
  }

  /**
   * Registers a function to be called when the socket is closed
   * @param callback The callback to call when the socket is closed.
   */
  public onClose = (callback: SocketOpenCloseCallback) => {
    this.onCloseEvents.push(callback);
  }

  /**
   * Registers a single function that will be called when the socket is closed, overrides any existing callback.
   * @param callback The callback to be called when the socket is detected as unauthorized.
   */
  public onUnauthorized = (callback: () => void) => {
    this.unauthorizedCallback = callback;
  }

  /**
   * Returns an awaitable promise of an event.
   * @param event The event to listen for.
   * @returns A promise that will be resolved when the event is fired.
   */
  public eventPromise = (event: string) => {
    return new Promise<EventPayload>((resolve) => {
      var listener = (payload: EventPayload, id: string) => { this.off(event, id); resolve(payload); }
      this.on(event, listener)
    })
  }

  /**
   * Emits an event to fire to the server.
   * @param event The event to fire
   * @param payload The payload of the event.
   */
  public emit = async (event: string, payload: EventPayload) => {
    if (this.socket === undefined || this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
      await this.eventPromise(INTERNAL_RECONNECT_EVENT);
    }
    if (this.socket !== undefined) {
      this.socket.send(JSON.stringify({ EventIdentifier: event, Payload: JSON.stringify(payload) }));
    } else {
      throw new Error("Attempted to emit event without initialization")
    }
  }

  /**
   * Closes the socket connection.
   */
  public Close = () => {
    if (this.socket !== undefined) {
      this.socket.onclose = () => { this.onSocketClose(); } // no additional handling needs to be done
      this.socket.close();
      this.socket = undefined;
    }
  }

  /**
   * Initializes the websocket. This will connect to the server and authenticate.
   * Allows then to send and receive events.
   * Ideally register all events before calling this!
   * Additionally will try to keep a steady and automatically reconnect upon disconnect.
   */
  public Initialize = async () => {
    this.attemptEndlessReconnection(); // attempt to connect
  }

}

