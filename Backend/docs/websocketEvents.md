## Websocket Events

Once a websocket connection is opened and accepted,
the user is already known as this implies being the holder of a login cookie.

This allows for the bidirectional communication of events.
In which one side listens for a event with an specified identifier,
and the other one can emit it with the same specifier.
(I pretty much didn't find a good C# SocketIO library, and I thought implementing one would be fun so I did :^))

Do note that internally on the frontend side, exists the concept of "temporary listeners" so these are only fired once, and then are deleted automatically.

I don't really know what usecase I found to those. I can't seem to remember. But they seem to work.