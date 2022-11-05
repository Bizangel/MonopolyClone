## Events Definition

This intends to explain all events, their intended structure and the way they communicate as backend-


## State Update Event

Most important event.
Broadcasts an update to all clients, attempting to synchronize game state.

This is a fat event tree, and will get updated accordingly.

```ts
{
  event: "state-update",
  payload: {
    currentTurn: int
    players: Players
  }
}
```

## Request State Update Event

Clients can emit this event to the server to request an state update.
(The state will only be sent to the requesting client)

```ts
{
  event: "request-state-update",
  payload: "" // will be ignored, but must be string
}
```

## Dice throw Start event

This notifies other users that the dice has been thrown.
A frontend user will emit this when it is his turn with the generated dice parameters.

The backend will then validate that the user is indeed in his turn, and then broadcast the event to other users. Other users should listen to this event, to then replicate the dice throw.

```ts
{
  event: "throw-dice-start"
  payload: {
    throwValues: [
      {
        velocity: Triplet,
        offset: Triplet,
      },
      {
        velocity: Triplet,
        offset: Triplet,
      }
    ]
  }
}
```

## Dice throw finish event

This notifies the result of the original dice-thrower. Notifying the result obtained from the dice, as well as their final world transform positions.

```ts
{
  event: "throw-dice-finish"
  payload: {
    diceLanded: [number, number],
    dicesStop: [Transform, Transform],
  }
}
```
