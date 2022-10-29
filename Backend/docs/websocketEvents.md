## Websocket Events

Once a websocket connection is opened and accepted,
the user is already known as this implies being the holder of a login cookie.

This allows for the bidirectional communication of events.
In which one side listens for a event with an specified identifier,
and the other one can emit it with the same specifier.
(I pretty much didn't find a good C# SocketIO library, and I thought implementing one would be fun so I did :^))