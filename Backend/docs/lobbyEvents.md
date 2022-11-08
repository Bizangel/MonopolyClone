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
