## Monopoly Turn Based Logic

Monopoly is effectively a turn based game.
The turn is represented as an index pointing to the current player.
However, multiple things can happen during a turn, unexpected!

Additionally, it would be not a great experience idk, for the user to fir
So this is to define kind of "phases" of a turn.

After the "switching" of each phase,
an status update will be sent,
so that players can all be synchronized.

Do be noted, that each of these phases imply that a user input is required.
Which is effectively why phases are defined. However some of these phases might be skipped.

## Phase 1 Standby

This is the initial phase, in which the user has not moved.
In this phase we await the user input, for any trades or actions other than rolling the dice.

Once the dice is rolled and the finish dice roll event, reporting the result of the dice is generated.
This phase is effectively over.

## Phase 2 Choiceby

This phase is the time in which the player is presented upon a choice to perform a turn, or not even a choice. Just awaiting input.
(So as to generate player engagement).

For example. If a user lands on a property. While he makes a choice the game is considered to be in a state of choiceby.

Things like for example.
If the user lands on another property, he still needs to click to perform the action of paying.
While we await the action of paying, the game is in the state of choiceby.

## Phase 3 Auctionby

This optional phase which not always happens, is when a property is effectively auctioned
and players must place their bids so the property goes to the highest bidder.

The property MUST be sold to someone.