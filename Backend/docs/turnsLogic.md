## Monopoly Turn Based Logic

Monopoly is effectively a turn based game.
The turn is represented as an index pointing to the current player.
However, multiple things can happen during a turn, unexpected!

Additionally, it would be not a great experience idk, for the user to fir
So this is to define kind of "phases" of a turn.

After the "switching" of each phase,
an status update will be sent,
so that players can all be synchronized.

## Phase 1 Standby

This is the initial phase, in which the user has not moved.
In this phase we await the user input, for any trades or actions other than rolling the dice.

Once the dice is rolled and the finish dice roll event, reporting the result of the dice is generated.
This phase is effectively over.

## Phase 2 Rollby

This could be considered a rather ephemeral phase,
however this is the time in which the player character is effectively coming to it's
target destination.

Consider that several things can happen here. Mainly for example,
the user might get +200 added to his account when he passed through the go.

## Phase 3 Purchaseby
(idk i thought it'd be cool for all phase names to be named ending on -by)

This is the final phase,
and it's usually when the user is presented with a choice
(which might or might not happen). For example a user might
land on it's own property. Nothing happens.

On the other hand the user might land on an unpurchased property,
which means he has the option to buy or auction.

The auction could be considered part of this phase,
or who knows I might change it into another phase later on.