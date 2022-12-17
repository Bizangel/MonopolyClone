import { useUserSocket } from "hooks/socketProvider"
import { BaseMiddleDisplayUI } from "./BaseMiddleDisplayUI"
import { EffectToAcknowledge } from "gameState/uiState"
import { propertyIDToImgpath } from "common/cardImages"
import { Button, Card } from "react-bootstrap"
import moneyimg from "assets/moneysprite_small.png"

export function EffectAcknowledgeOverlay(props: { effect: EffectToAcknowledge, enabled: boolean }) {
  const userSocket = useUserSocket()

  var possibleImg: React.ReactNode | null = null
  var appendMoneySymbol = false;

  if (props.effect.effect.effectID === 0) { // is property
    possibleImg = (<img className="rounded"
      style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
      src={propertyIDToImgpath.get(props.effect.effect.propertyID)} alt="" ></img>
    )
  }

  const acknowledgeEffect = () => {
    userSocket.emit("effect-acknowledge", "");
  };

  var displayText = "OK";

  if (props.effect.description.toLowerCase().includes("pay")) {
    displayText = "Pay";
    appendMoneySymbol = true;
  }

  return (
    <BaseMiddleDisplayUI
      upper={
        <Card>


          <p className="text-justify text-center text-primary"
            style={{ fontSize: "3vh" }}>{props.effect.description}

            {appendMoneySymbol &&
              <img className="rounded float-left img-fluid mw-100 mh-100"
                style={{ width: "20px", height: "10px" }}
                src={moneyimg} alt=""></img>
            }
          </p>


        </Card>
      }
      middle={possibleImg}
      below={
        <Button disabled={!props.enabled} onClick={acknowledgeEffect}>{displayText}</Button>
      }
    />
  )
};