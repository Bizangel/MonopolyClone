import { HouseImgTag, MoneyImgTag, TransportImgTag } from "common/common";
import { useUserSocket } from "hooks/socketProvider";
import { BaseMiddleDisplayUI } from "./BaseMiddleDisplayUI"
import { Button, Card, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { propertyIDToImgpath } from "common/cardImages";
import { propertyIDToPrice } from "common/propertiesMapping";
import { propertyToColor } from "common/propertyConstants";
import { Player, PropertyDeed, useGameState } from "gameState/gameState";
import { characterToSprite } from "common/characterSprites";
import { TurnPhase } from "gameState/uiState";

export function PropertyDetailsOverlay(props: {
  enabled: boolean, propertyID: number,
  /**
   * An optional callback to use to hide the details window
   */
  onHide?: () => void,
}) {

  const userSocket = useUserSocket();
  const currentTurn = useGameState(e => e.currentTurn)
  const players = useGameState(e => e.players);
  const hasPurchasedUpgrade = useGameState(e => e.uiState.hasPurchasedUpgrade)
  const currentTurnPhase = useGameState(e => e.uiState.turnPhase);

  const purchaseHouseUpgrade = () => {
    userSocket.emit("upgrade-property", props.propertyID)
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

  var hasAllOfSameColor = false;
  var countSameColor = 0;
  if (owner) {
    owner.properties.forEach(e => {
      if (propertyToColor(e.propertyID) === thisColorGroup)
        countSameColor++;
    })



    if (thisColorGroup === "brown" || thisColorGroup === "blue")
      hasAllOfSameColor = countSameColor === 2;
    else
      hasAllOfSameColor = countSameColor === 3;

    if (thisColorGroup === "black" || thisColorGroup === "gray")
      hasAllOfSameColor = false;

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

  var isCurrentTurn = players[currentTurn].name === userSocket.Username;

  // check if can upgrade
  var cannotUpgrade: string | undefined = undefined;

  if (thisColorGroup === "black" || thisColorGroup === "gray") {
    cannotUpgrade = "This type of property cannot be upgraded";
  }
  else if (thisOwned?.upgradeState === 5) {
    cannotUpgrade = "This property is already at max upgrade level";
  }
  else if (!hasAllOfSameColor) {
    cannotUpgrade = "You need all the properties of the same color to upgrade first";
  }
  else if (!isCurrentTurn || currentTurnPhase !== TurnPhase.Standby) {
    cannotUpgrade = "You can only upgrade properties during the first phase of your turn";
  }
  else if (hasPurchasedUpgrade) {
    cannotUpgrade = "You can only purchase an upgrade once a turn";
  } else if (upgradeCost !== null && owner !== null && owner.money < upgradeCost) {
    // If I'm not the owner then it won't be displayed altogether, so we're checking the money against the owner
    cannotUpgrade = "Not enough money";
  }



  var hideTooltip = cannotUpgrade !== undefined ? "" : "invisible";

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
          {
            owner?.name === userSocket.Username &&
            <Col xs="3">
              <OverlayTrigger
                placement="left"
                trigger={["focus", "hover"]}
                overlay={
                  <Tooltip className={hideTooltip}>
                    {cannotUpgrade !== undefined &&
                      cannotUpgrade
                    }
                  </Tooltip>
                }
              >
                <span>
                  <Button disabled={!props.enabled || cannotUpgrade !== undefined} onClick={purchaseHouseUpgrade}>Purchase Upgrade</Button>
                </span>
              </OverlayTrigger>
            </Col>
          }
          <Col xs="3">
            <Button disabled={!props.enabled} variant="secondary" onClick={props.onHide}>Close</Button>
          </Col>
        </>
      }
    />
  )
}