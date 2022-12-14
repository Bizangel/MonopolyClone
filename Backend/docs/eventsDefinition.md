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

## Player Effect Acknowledge

This event is sent by the player acknowledgeging that the necessary contextual amount will be paid/gained.
This event will be fired in multiple occasions:
This event is only valid in case:
1. There's no valid property to be possibly auctioned (in that case the event property choice must be used below)
2. The current state of the game is choiceby
3. Of course, it's the turn of the actual sender.

-> Paying to differently owned property <-
-> Paying to Tax or negative effect on landed square <-

```ts
{
  event: "effect-acknowledge"
  payload: "" // ignored
}
```

## Player Property Choice

This event is sent by the player to make a choice in regards to the current property to _possibly_ auction.
This effectively makes the choice of the player to either buy or auction a property.

If the player decides to buy the property, the turns instantly ends, with him owning the property.

The option to buy will be rejected (ideally blacked out on frontend side),
if the player does not have the money to purchase the property.

```ts
{
  event: "property-choice"
  payload: "buy" | "auction"
}
// Example Event
{
  event: "property-choice"
  payload: "buy"
}
```

# Auction Events

For auctioning then we have other interesting events.

## Place Bid Event

This is sent by the player in order to place a bid.
This "may" or "may not" update the property with the highest property.
```ts
{
  event: "auction-place-bid"
  payload: number
}
// example
{
  event: "auction-place-bid"
  payload: 150 // amount to bid
}
```

## Auction Sold Confirmation Event

(This should ideally trigger some visual effect on the frontend)
This event is fired off, to notify individuals of the winner of the auction.

```ts
{
  event: "auction-winner",
  payload: string
}
// example
{
  event: "auction-winner",
  payload: "bizangel" // username of winner of auction
}
```

