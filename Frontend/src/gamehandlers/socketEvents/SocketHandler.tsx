import { readCookie, WSSHOST } from "common/common";
import { SocketEventMessageSchema } from "schemas";
import { sleep } from "utils/funcs";

export type SocketEventCallback = (payload: any) => void;
export type SocketOpenCloseCallback = (user: UserSocket) => void;

const INTERNAL_RECONNECT_EVENT = "INTERNAL-RECONNECT-EVENT"

type InternalSocketEventCallback = {
  eventcallback: SocketEventCallback;
};

type InternalSocketOpenCloseCallback = {
  openclosecallback: SocketOpenCloseCallback;
}

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
  private temporaryEvents: Map<string, InternalSocketEventCallback[]>;
  private RegisteredEvents: Map<string, InternalSocketEventCallback[]>;
  private onOpenEvents: InternalSocketOpenCloseCallback[];
  private onCloseEvents: InternalSocketOpenCloseCallback[];
  private unauthorizedCallback: () => void;

  public get Username() {
    return this.authenticatedUser;
  }

  constructor() {
    var username = "";

    this.authenticatedUser = username;

    this.temporaryEvents = new Map<string, InternalSocketEventCallback[]>();
    this.RegisteredEvents = new Map<string, InternalSocketEventCallback[]>();
    this.onOpenEvents = [];
    this.onCloseEvents = [];

    this.unauthorizedCallback = () => { };
  }

  private onSocketOpen = async () => {
    console.log("socket opened!")
    this.InvokeRegisteredEventHandlers("", "", SocketEventTypes.OpenEvent);
  }

  private onSocketClose = () => {
    console.log("socket closed!")
    this.InvokeRegisteredEventHandlers("", "", SocketEventTypes.CloseEvent);
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

    // Fire normal events
    this.InvokeRegisteredEventHandlers(parsed.data.EventIdentifier, parsed.data.Payload, SocketEventTypes.SocketEvent);
    // Fire temporary events
    this.InvokeRegisteredEventHandlers(parsed.data.EventIdentifier, parsed.data.Payload, SocketEventTypes.TempEvent);
  }

  private handleOnError = (event: Event) => {
    // this will automatically fire handleOnClose
    console.warn("Websockets Errored:")
    this.onSocketClose()

    // attempt to reconnect.
    this.attemptEndlessReconnection()
  }


  private handleOnClose = (event: CloseEvent) => {
    console.log("Connection closed, reason: " + event.reason)
    this.onSocketClose();
    if (event.reason === "Unauthorized") { this.unauthorizedCallback(); }
    else {  // if not unauthorized, then attempt to try reconnecting
      this.attemptEndlessReconnection();
    }

  }

  private ResolveEventTypeToHandlers = (
    eventType: SocketEventTypes,
    event_id: string | null,
    createIfEmpty: boolean = false): InternalSocketEventCallback[] | undefined => {
    var handlers = undefined;
    switch (eventType) {
      case SocketEventTypes.SocketEvent:
        if (event_id === null) {
          return undefined;
        }

        if (createIfEmpty) {
          handlers = this.RegisteredEvents.get(event_id);
          if (handlers === undefined) {
            this.RegisteredEvents.set(event_id, []);
          }
        }


        return this.RegisteredEvents.get(event_id);;
      case SocketEventTypes.TempEvent:
        if (event_id === null) {
          return undefined;
        }

        if (createIfEmpty) {
          handlers = this.temporaryEvents.get(event_id);
          if (handlers === undefined) {
            this.temporaryEvents.set(event_id, []);
          }
        }


        return this.temporaryEvents.get(event_id);
      default:
        throw new Error("Invalid event type");
    }
  }

  private ResolveOpenCloseEventsToType = (eventType: SocketEventTypes): InternalSocketOpenCloseCallback[] | undefined => {
    switch (eventType) {
      case SocketEventTypes.OpenEvent:
        return this.onOpenEvents;
      case SocketEventTypes.CloseEvent:
        return this.onCloseEvents;
      default:
        throw new Error("Invalid event type");
    }
  }

  private InvokeRegisteredEventHandlers = (event_id: string, payload: string, eventType: SocketEventTypes) => {
    var handlers = undefined;
    if (eventType === SocketEventTypes.OpenEvent || eventType === SocketEventTypes.CloseEvent) {
      handlers = this.ResolveOpenCloseEventsToType(eventType);

      if (handlers !== undefined) {
        handlers.forEach(handler => {
          handler.openclosecallback(this);
        });
      }
    } else {
      handlers = this.ResolveEventTypeToHandlers(eventType, event_id);
      if (handlers !== undefined) {
        handlers.forEach(handler => {
          handler.eventcallback(payload);
        });

        if (eventType === SocketEventTypes.TempEvent) {
          handlers.length = 0; // clear array
        }
      }
    }
  }


  private addEventListener = (event: string, callback: InternalSocketEventCallback | InternalSocketOpenCloseCallback, eventType: SocketEventTypes) => {
    var handlers;
    if ("eventcallback" in callback) {
      if (eventType === SocketEventTypes.SocketEvent || eventType === SocketEventTypes.TempEvent) {
        handlers = this.ResolveEventTypeToHandlers(eventType, event, true);
        if (handlers !== undefined) {
          handlers.push(callback);
        }

      } else {
        throw new Error("Invalid event type with callback type");
      }
    } else {
      if (eventType === SocketEventTypes.OpenEvent || eventType === SocketEventTypes.CloseEvent) {
        handlers = this.ResolveOpenCloseEventsToType(eventType);
        if (handlers !== undefined) {
          handlers.push(callback);
        }
      } else {
        throw new Error("Invalid event type with callback type");
      }
    }
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

    if (resolved === "opened" && this.socket === undefined) {
      // read cookie for username
      var username = readCookie("Auth-User");
      if (username === null) {
        throw new Error("At gamepage without auth-user cookie")
      }

      this.authenticatedUser = username;
      await this.onSocketOpen();
      this.socket = socket;
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
   * Adds a temporary event listener, that will called once and then be deleted once the event is fired.
   * @param event The event to bind to.
   * @param callback The callback to fire.
   */
  public addTemporaryEventListener = (event: string, callback: SocketEventCallback) => {
    this.addEventListener(event, { eventcallback: callback }, SocketEventTypes.TempEvent);
  }

  /**
   * Adds an event listener to the socket.
   * @param event The event to listen for.
   * @param callback The callback to call when the event is fired.
   */
  public on = (event: string, callback: SocketEventCallback) => {
    this.addEventListener(event, { eventcallback: callback }, SocketEventTypes.SocketEvent);
  }

  /**
   * Registers a function to be called when the socket is opened (Is authenticated and able to send and receive events).
   * Internally Opening is called when the socket is opened, but publicly, this is called when the socket is authenticated.
   * @param callback The callback to call when the socket is opened.
   */
  public onReady = (callback: SocketOpenCloseCallback) => {
    this.addEventListener("", { openclosecallback: callback }, SocketEventTypes.OpenEvent);
  }

  /**
   * Registers a function to be called when the socket is closed
   * @param callback The callback to call when the socket is closed.
   */
  public onClose = (callback: SocketOpenCloseCallback) => {
    this.addEventListener("", { openclosecallback: callback }, SocketEventTypes.CloseEvent);
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
  public getPromiseFromEvent = (event: string) => {
    return new Promise<string>((resolve) => {
      const listener = (payload: string) => { resolve(payload); }
      this.addTemporaryEventListener(event, listener);
    })
  }

  /**
   * Emits an event to fire to the server.
   * @param event The event to fire
   * @param payload The payload of the event.
   */
  public emit = async (event: string, payload: string) => {
    if (this.socket !== undefined) {
      if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
        await this.getPromiseFromEvent(INTERNAL_RECONNECT_EVENT)
      }

      this.socket.send(JSON.stringify({ EventIdentifier: event, Payload: payload }));
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
    await this.attemptEndlessReconnection(); // attempt to connect
  }

}

