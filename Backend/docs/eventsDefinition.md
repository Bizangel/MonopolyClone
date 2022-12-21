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

## Start Trade Event

This will be sent by the player to notify the intent to start a new trade with
another player.
```ts
{
  event: "start-trade"
  payload: string
}

//
{
  event: "start-trade"
  payload: "bizangel" // player to trade
}

```

## Trade Offer Set Event

This event is sent by the player to set his terms of the offer.
The other player will do the same.
The server is intended to verify both the origins of the messages, as well as the availability of their proposed resources.
If these are invalid, the server will ignore the request.

```ts
{
  event: "trade-offer-set"
  payload: {
    money: number,
    properties: {propertyID: number, upgradeLevel: number}[],
  }
}

{
  event: "trade-offer-set"
  payload: {
    money: 30 // offering 30 as money
    properties: [{propertyID: 0, upgradeState: -1}, {propertyID: 1, upgradeState: 2}] // offering properties 0 and 12
  }
}
```

## Trade Consent Event

This event is for the player to define their agreement in regards to the current trade.
The user can either accept, reject or cancel the trade.
Cancel outright stops the process trading, rejecting on the other side,
simply switches the status to not accepted, in case it was already.

Once any party switches any of their offers via the previous `trade-offer-set`,
all parties must agree once again and the consent status will be reset to rejected by default.

As soon as both parties register their consent, the trade will automatically go through.


```ts
{
  event: "trade-consent"
  payload: "accept" | "reject" | "cancel"
}
// example
{
  event: "trade-consent"
  payload: "cancel"
}
```

## Upgrade Event

This event is sent by the players to notify the desire to upgrade a property.

The server will check if they can upgrade said property should the following three criteria be met:

1. The player has all the properties of the same color, and owns the property to upgrade.
2. The player has not upgraded any property in that turn
3. The player has the money to upgrade the property.

Should it be successful it will be notified in the next UIState broadcast.
The act of upgrading properties can only be performed during the initial turnphase of
```ts
{
  event: "upgrade-property"
  payload: int, // property id
}
// example
{
  event: "upgrade-property"
  payload: 2, // upgrade property
}
```

## Downgrade Event

Effectively very similar as the previous event. However this signifies a downgraed of the property.
i.e. selling houses or mortgaging the property. The status of -1 means a property is mortgaged.

```ts
{
  event: "downgrade-property"
  payload: 2, // the property to sell a house or downgrade
}
```

## Message Display Event

This event is sent from the server to players to notify ephemeral displays to give the players a better game sense.
For example this event is intended to be called:

- When the user pays jail fine, to explain
- When the user rolls a double
- To display the winner of an auction

```ts
{
  event: "message-display",
  payload: string,
}

// example
{
  event: "message-display",
  payload: "player rolled a doubles!"
}
```

## Game Results Finish Event

This event will be
```ts
{
  event: "game-done-results"
  payload: {
    players: Player[],
    netWorth: int[],
  }
}
// example
{
  event: "game-done-results"
  payload: {
    players: ..., // regular player definnition
    netWorth: [1203, 2000, 2500], // the value of each player, the highest oner is declared the winner
  }
}
```
