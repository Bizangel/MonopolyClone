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


function DiceImg(props: { diceNumber: number }) {
  const style = { width: "100%", border: "0px" };
  switch (props.diceNumber) {
    case 1:
      return <Dice1 style={style} />
    case 2:
      return <Dice2 style={style} />
    case 3:
      return <Dice3 style={style} />
    case 4:
      return <Dice4 style={style} />
    case 5:
      return <Dice5 style={style} />
    case 6:
      return <Dice6 style={style} />
    default:
      throw new Error("Request to render invalid dice number!");
  }
}

export function DiceDisplay(props: DiceDisplayProps) {
  return (
    <div style={{ width: "10vw", height: "10vh", maxWidth: "80px", maxHeight: "80px" }}>
      <DiceImg diceNumber={props.number} />
    </div>
  )
}