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
import { useEffect, useState } from "react";

export function PropertyDetailsOverlay(props: {
  enabled: boolean, propertyID: number,
  /**
   * An optional callback to use to hide the details window
   */
  onHide?: () => void,
}) {

  const [consciusEnabled, setConsciusDisable] = useState(false);

  const userSocket = useUserSocket();
  const currentTurn = useGameState(e => e.currentTurn)
  const players = useGameState(e => e.players);
  const hasPurchasedUpgrade = useGameState(e => e.uiState.hasPurchasedUpgrade)
  const currentTurnPhase = useGameState(e => e.uiState.turnPhase);

  const purchaseHouseUpgrade = () => {
    userSocket.emit("upgrade-property", props.propertyID)
  };

  const downgradeHouse = () => {
    userSocket.emit("downgrade-property", props.propertyID)
  };

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setConsciusDisable(true);
    }, 1000); // after a seconds enable purchase and downgrade button to avoid misclicks

    return () => {
      clearTimeout(timeoutID);
    }
  }, []);

  var propertyPrice = propertyIDToPrice.get(props.propertyID);
  if (propertyPrice === undefined)
    throw new Error("Non defined property price! for propID: " + props.propertyID)

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

  var upgradeButtonTextDisplay = "Purchase Upgrade"

  var isMortgaged = thisOwned?.upgradeState === -1;

  var mortgageFilter = isMortgaged ? "brightness(50%)" : ""
  // if mortgaging, less checks
  if (isMortgaged) {


    upgradeButtonTextDisplay = "Pay Mortgage"
    upgradeCost = propertyPrice / 2;
    cannotUpgrade = undefined;// cannot upgrade doesn't apply as it's mortgaging

    if (!isCurrentTurn || currentTurnPhase !== TurnPhase.Standby)
      cannotUpgrade = "You can only pay mortgages on the first phase of your turn"

    // only check for money
    if (owner !== null && owner.money < upgradeCost) {
      cannotUpgrade = "Not enough money"
    }

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

          <p className="text-justify text-center text-primary">Base Cost: {propertyPrice}
            <MoneyImgTag />
          </p>

          {
            owner && thisOwned && !isMortgaged &&
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

          {isMortgaged && <i>This property is mortgaged</i>}
        </Card >
      }
      middle={
        <img
          onClick={props.onHide}
          className="rounded" style={{
            filter: mortgageFilter,
            width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto"
          }}
          src={propertyIDToImgpath.get(props.propertyID)} alt=""></img>}

      below={
        <>
          {
            owner?.name === userSocket.Username &&
            <Col xs="3" className="d-flex justify-content-center">
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
                  <Button disabled={!props.enabled || cannotUpgrade !== undefined || !consciusEnabled} onClick={purchaseHouseUpgrade}>
                    <p>{upgradeButtonTextDisplay}</p>
                    <span>
                      {upgradeCost}<MoneyImgTag />
                    </span>
                  </Button>
                </span>
              </OverlayTrigger>
            </Col>
          }
          <Col xs="3" className="d-flex justify-content-center">
            <Button disabled={!props.enabled} variant="secondary" onClick={props.onHide}>Close</Button>
          </Col>

          {
            owner?.name === userSocket.Username && thisOwned !== null && thisOwned.upgradeState > 0 && upgradeCost !== null &&
            <Col xs="3" className="d-flex justify-content-center">
              <Button disabled={!props.enabled || !consciusEnabled} variant="danger" onClick={downgradeHouse}>
                <p>Sell House</p>
                <span>
                  +{Math.floor(upgradeCost / 2)} <MoneyImgTag />
                </span>
              </Button>
            </Col>
          }

          {
            owner?.name === userSocket.Username && thisOwned !== null && thisOwned.upgradeState === 0 &&
            <Col xs="3">
              <Button disabled={!props.enabled || !consciusEnabled} variant="danger" onClick={downgradeHouse}>
                <p>Mortgage Property</p>
                <span>
                  +{Math.floor(propertyPrice / 2)} <MoneyImgTag />
                </span>
              </Button>
            </Col>
          }
        </>
      }
    />
  )
}