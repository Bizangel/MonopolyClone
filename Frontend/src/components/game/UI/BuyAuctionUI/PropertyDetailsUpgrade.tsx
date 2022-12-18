import { HouseImgTag, MoneyImgTag, TransportImgTag } from "common/common";
import { useUserSocket } from "hooks/socketProvider";
import { BaseMiddleDisplayUI } from "./BaseMiddleDisplayUI"
import { Button, Card, Col } from "react-bootstrap";
import { propertyIDToImgpath } from "common/cardImages";
import { propertyIDToPrice } from "common/propertiesMapping";
import { propertyToColor } from "common/propertyConstants";
import { Player, PropertyDeed, useGameState } from "gameState/gameState";
import { characterToSprite } from "common/characterSprites";

/// TODO add house can pay validation to display

export function PropertyDetailsOverlay(props: {
  enabled: boolean, propertyID: number,
  /**
   * An optional callback to use to hide the details window
   */
  onHide?: () => void,
}) {

  const userSocket = useUserSocket();
  const players = useGameState(e => e.players);

  const purchaseHouseUpgrade = () => {
    console.log("attempting upgrade");
  };

  var thisOwned: PropertyDeed | null = null;
  var owner: Player | null = null;

  const thisColorGroup = propertyToColor(props.propertyID);

  // had to do this manual for loop cuz typescript was being retarded and not picking up .forEach loop
  for (var i = 0; i < players.length; i++) {
    var player = players[i];
    for (var j = 0; j < player.properties.length; j++) {
      if (player.properties[j].propertyID === props.propertyID) {
        owner = player;
        thisOwned = player.properties[j];
        break;
      }
    }
  }

  var countSameColor = 0;
  if (owner) {
    owner.properties.forEach(e => {
      if (propertyToColor(e.propertyID) === thisColorGroup)
        countSameColor++;
    })
  }

  var upgradeCost: number | null = null;

  if (thisColorGroup === "brown" || thisColorGroup === "lightblue") {
    upgradeCost = 50;
  } else if (thisColorGroup === "pink" || thisColorGroup === "orange") {
    upgradeCost = 100;
  } else if (thisColorGroup === "red" || thisColorGroup === "yellow") {
    upgradeCost = 150;
  } else if (thisColorGroup === "green" || thisColorGroup === "blue") {
    upgradeCost = 200;
  }

  var upgradeDisplay: React.ReactNode = (
    <>
      {`${thisOwned?.upgradeState} `} <HouseImgTag />
    </>
  );
  if (thisColorGroup === "black") { // services
    upgradeDisplay = (
      <>
        {`${countSameColor} `}
        <TransportImgTag />
      </>
    )
  }
  if (thisColorGroup === "gray") { // services
    var s = countSameColor === 1 ? "" : "s"
    upgradeDisplay = `${countSameColor} Service${s}`
  }

  return (
    <BaseMiddleDisplayUI

      upper={
        <Card style={{ width: "50%" }} onClick={props.onHide}>
          <p className="text-justify text-center text-primary">
            Owner:
            {
              owner !== null &&
              <img className="rounded" style={{ width: "40px", height: "40px" }} src={characterToSprite.get(owner.character)} alt=""></img>
            }
            {
              owner === null &&
              <i>No Owner</i>
            }
          </p>

          <p className="text-justify text-center text-primary">Base Cost: {propertyIDToPrice.get(props.propertyID)}
            <MoneyImgTag />
          </p>

          {
            owner && thisOwned &&
            <>
              {
                upgradeCost &&
                <p className="text-justify text-center text-primary">Upgrade Cost: {upgradeCost}
                  <MoneyImgTag />
                </p>
              }

              <p className="text-justify text-center text-info">
                Current Upgrade: {upgradeDisplay}
              </p>
            </>
          }

        </Card >
      }
      middle={<img
        onClick={props.onHide}
        className="rounded" style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
        src={propertyIDToImgpath.get(props.propertyID)} alt=""></img>}

      below={
        <>
          <Col xs="3">
            <Button disabled={!props.enabled} onClick={purchaseHouseUpgrade}>Purchase Upgrade</Button>
          </Col>
          <Col xs="3">
            <Button disabled={!props.enabled} variant="secondary" onClick={props.onHide}>Close </Button>
          </Col>
        </>
      }
    />
  )
}