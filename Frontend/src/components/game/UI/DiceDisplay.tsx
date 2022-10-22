import React from "react";

const Dice1 = require("assets/dicesvg/dice1.svg").ReactComponent;
const Dice2 = require("assets/dicesvg/dice2.svg").ReactComponent;
const Dice3 = require("assets/dicesvg/dice3.svg").ReactComponent;
const Dice4 = require("assets/dicesvg/dice4.svg").ReactComponent;
const Dice5 = require("assets/dicesvg/dice5.svg").ReactComponent;
const Dice6 = require("assets/dicesvg/dice6.svg").ReactComponent;

type DiceDisplayProps = {
  number: number,
}


function diceImg(diceNumber: number) {
  switch (diceNumber) {
    case 1:
      return <Dice1 />
    case 2:
      return <Dice2 />
    case 3:
      return <Dice3 />
    case 4:
      return <Dice4 />
    case 5:
      return <Dice5 />
    case 6:
      return <Dice6 />
    default:
      throw new Error("Request to render invalid dice number!");
  }
}

export function DiceDisplay(props: DiceDisplayProps) {
  return (<div style={{ width: "5vw", height: "5vw" }}>
    {diceImg(props.number)}
  </div>)
}