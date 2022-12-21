
using MonopolyClone.Common;
using MonopolyClone.Database.Models;
using MonopolyClone.Game;
using Newtonsoft.Json;
namespace MonopolyClone.TileEffects;


class GoToTileEffect : TileEffect
{
    [JsonRequired]
    int destination { get; init; }

    public override string DescribeEffect(Player player, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        return "";
    }

    public override void ExecuteEffect(
      Player landedPlayer, List<Player> allPlayers, GameState gameState, Game.GameBoard gameBoard)
    {
        var steps = 0;
        var location = landedPlayer.location;
        while (location != destination)
        {
            location++;
            steps++;
            location %= BoardConstants.BoardSquares;
        }

        var rollResult = gameBoard.HandlePlayerDiceRoll(landedPlayer, new int[] { steps }, gameState); // he doesn't use the dice roll in display, so we're just abusing it, as he just forwards it in response.


        if (!rollResult.requiredInput) // no required input. just apply any necessary effect and finish turn
        {
            if (rollResult.effectToApply != null)
            {
                gameBoard.ApplyEffect(rollResult.effectToApply.effect, landedPlayer, gameState);
            }
            // haven't preveted, turn will end after moving like usual
            return;
        }

        if (MonopolyGame.Instance.RollResult == null)
            throw new ArgumentException("Roll result is none despite just being thrown?");

        MonopolyGame.Instance.SetRollResultManually(
            new RollResult()
            {
                diceResult = MonopolyGame.Instance.RollResult.diceResult,
                requiredInput = rollResult.requiredInput,
                possibleAuction = rollResult.possibleAuction,
                effectToApply = rollResult.effectToApply,
            }
        );

        MonopolyGame.Instance.AcknowledgeEffectPreventTurn = true; // prevent it from ending // another choice will be presented.
    }
}