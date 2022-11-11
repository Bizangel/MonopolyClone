Lobby basic notes copied directly from my .txt:

```
The whole *lobby* process, will be same socket* to keep things simpler (maybe it complicates it?).
Once the first "status-update" happens. The frontend is intended to redirect players to the gamepage accordingly.

Categories for "Game events" and Lobby events will be made. Idea is that *Lobby* Events should be totally independent.

Thus making a nice annotation, like [LobbyEvent] for specifying the event Tag.
Thus *default* events those without a tag should be default or GameEvents.
Thus if the game is in a certain mode "i.e Lobby Mode", it will ignore all game-events, and only handle lobby mode.
Same way otherwise. If game events, lobby mode events should be ignored.

For the discconects or reloads, a OnSocketConnect event should be added. *IF* the game is in "GameMode" then as soon as the connection is identified it will broadcast the status-update for the client to be synced back up to date.
```

These event happens at the beginning, in relation to lobby management.


## Lobby Join Event

The client will send this along with the password to notify their intent to join the lobby.
```ts
{
  event: "lobby-join",
  payload: string, // password
}
```

## Lobby Fail Event

Sent back to the user after a he emits a lobby join event
and it fails. Either because of game started or because invalid password.
```ts
{
  event: "lobby-join-fail",
  payload: string // message
}
```

## Lock Event

In this event the player attempts to locks the player notifying the server.
If it is successful, it will be reflected in a lobby updated.

```ts
{
  event: "lobby-lock",
  payload: Character // character index from 0-5 as enum-defined
}
```

## Unlock Event

In this event the player attempts to unlocks his current selection.

```ts
{
  event: "lobby-unlock",
  payload: string // will be ignored
}
```

## Lobby Update Event

This updates all connected players the status of the lobby.
(This might include players that are outside the lobby waiting to join (without a password))

```ts
type Player = {
  name: string,
  character: PlayerCharacter
}

{
  event: "lobby-update",
  players: Player[]
}
```
