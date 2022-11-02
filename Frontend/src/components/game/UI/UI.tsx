// import { DiceDisplay } from "./DiceDisplay";

import { MultipleUserBars } from "./UserBar/UserBar"

export function UI() {
  return (
    <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1 }}>
      {/* <DiceDisplay number={1} /> */}

      <MultipleUserBars />
    </div>
  )
}