## Events Definition

This intends to explain all events, their intended structure and the way they communicate as backend-

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
