import { WSSHOST } from "common/common";
import { SocketEventMessageSchema } from "schemas";

export type SocketEventCallback = (payload: string) => void;
export type SocketOpenCloseCallback = (user: UserSocket) => void;


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

  constructor(username: string) {
    this.authenticatedUser = username;

    this.temporaryEvents = new Map<string, InternalSocketEventCallback[]>();
    this.RegisteredEvents = new Map<string, InternalSocketEventCallback[]>();
    this.onOpenEvents = [];
    this.onCloseEvents = [];

    this.unauthorizedCallback = () => { };
  }

  private handleOnOpen = async (event: Event) => {
    this.InvokeRegisteredEventHandlers("", "", SocketEventTypes.OpenEvent);
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
    if (!parsed.success)
      return;

    // Fire normal events
    this.InvokeRegisteredEventHandlers(parsed.data.EventIdentifier, parsed.data.Payload, SocketEventTypes.SocketEvent);
    // Fire temporary events
    this.InvokeRegisteredEventHandlers(parsed.data.EventIdentifier, parsed.data.Payload, SocketEventTypes.TempEvent);
  }

  private handleOnError = (event: Event) => {
    console.log("Websocket error!");
    // this will automatically fire handleOnClose
  }


  private handleOnClose = (event: CloseEvent) => {
    console.log("Connection closed, reason: " + event.reason)
    if (event.reason === "Unauthorized") { this.unauthorizedCallback(); }
    this.InvokeRegisteredEventHandlers("", "", SocketEventTypes.CloseEvent);
  }

  private ResolveEventTypeToHandlers = (eventType: SocketEventTypes, event_id: string | null, createIfEmpty: boolean = false): InternalSocketEventCallback[] | undefined => {
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
  public emit = (event: string, payload: string) => {
    if (this.socket !== undefined) {
      this.socket.send(JSON.stringify({ EventIdentifier: event, Payload: payload }));
    } else {
      throw new Error("Attempted to emit event without initialization")
    }
  }


  /**
   * Closes the socket connection.
   */
  public Close = () => {
    if (this.socket !== undefined)
      this.socket.close();
  }
  /**
   * Initializes the websocket. This will connect to the server and authenticate.
   * Allows then to send and receive events.
   * Ideally register all events before calling this!
   * Additionally will try to keep a steady and automatically reconnect upon disconnect.
   */
  public Initialize = async () => {
    this.socket = new WebSocket(WSSHOST() + "/ws");

    this.socket.onmessage = this.handleOnMessage;
    this.socket.onclose = this.handleOnClose;
    this.socket.onerror = this.handleOnError;
    this.socket.onopen = this.handleOnOpen;
  }
}

