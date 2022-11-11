import { Button, Row } from "react-bootstrap";
import { DiceDisplay } from "./DiceDisplay";

import { MultipleUserBars } from "./UserBar/UserBar"


export function UI() {
  return (
    <>

      <div style={{ position: "absolute", left: "0px", top: "0px", zIndex: 1 }}>
        <MultipleUserBars />
      </div>

      <div style={{ position: "absolute", right: "20px", top: "2vh", zIndex: 1, opacity: 0.7 }}>
        <Row>
          <DiceDisplay number={5} />
          <DiceDisplay number={2} />
        </Row>
      </div>


      {/*  actual button */}
      <div style={{
        position: "absolute", left: "45vw", bottom: "5vh", width: "10vw", height: "10vh", zIndex: 1,
        alignItems: "center", textAlign: "center", display: "inline-block"
      }}>
        <Button onClick={() => { console.log("clicked!") }} variant="primary">
          Roll Dice!
        </Button>
      </div>

    </>
  )
}