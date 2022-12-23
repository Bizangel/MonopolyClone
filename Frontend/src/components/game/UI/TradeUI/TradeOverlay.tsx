import { MoneyImgTag } from "common/common"
import { useCallback, useState } from "react"
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"
import { HorizontalPropertyWindow } from "./HorizontalPropertyDisplay"
import { TradeOffer, UIState } from "gameState/uiState";
import { useUserSocket } from "hooks/socketProvider";
import { PropertyDeed, useGameState } from "gameState/gameState";
import { arrayContains } from "utils/funcs";


function TradeDisplayWindowContainerless(props:
  {
    reverse?: boolean, topDisplay: string, offer: TradeOffer, agreed: boolean,
    onPropertyClick: (property: PropertyDeed) => void,
  }) {

  var agreedFilter = props.agreed ? "grayscale(150%) sepia(150%) hue-rotate(80deg)" : ""
  return (
    <Container className="m-0 p-0 d-flex flex-column g-0" style={{ width: "100%", height: "100%", filter: agreedFilter }} >
      <Row className="m-0 p-0" style={{ flexGrow: 1, position: "sticky", left: 0, top: 0 }}>
        <Card className="justify-center text-center">
          <Row className="justify-center text-center m-0">
            <div className="text-primary">
              {props.topDisplay}
            </div>
          </Row>
          <Row className="justify-center text-center m-0">
            <div className="text-primary">
              {props.offer.money} <MoneyImgTag /> +
            </div>
          </Row>
        </Card>
      </Row>
      <Row className="m-0 p-0" style={{ flexGrow: 4, maxHeight: "75%" }}>
        <HorizontalPropertyWindow reverse={props.reverse} properties={props.offer.properties} onPropertyClick={props.onPropertyClick} />
      </Row>
    </Container>
  )
};

function TraderPickWindow(props: {
  properties: PropertyDeed[]
  remainingMoney: number
  onUpdateTradeMoney: (tradeMoney: string) => void,
  onPropertyClick: (propertyID: PropertyDeed) => void,
}) {

  const userSocket = useUserSocket();
  const [moneyFormBox, setMoneyFormBox] = useState("");

  const acceptTrade = () => {
    userSocket.emit("trade-consent", "accept");
  };

  const cancelConsent = () => {
    userSocket.emit("trade-consent", "reject");
  };

  const cancelTrade = () => {
    userSocket.emit("trade-consent", "cancel");
  };

  return (
    <Container className="m-0 p-0 d-flex flex-row g-0 mw-100 mh-100">
      <Button style={{ position: "absolute", left: 0, top: "-18%", zIndex: 3, height: "18%" }} variant="danger" onClick={cancelTrade}>Cancel Trade</Button>

      <Col className="m-0 p-0 d-flex flex-column" style={{ width: "100%" }}>
        <Button style={{ position: "absolute", right: "0%", top: "-18%", zIndex: 3, width: "10%", height: "18%" }} variant="primary" onClick={acceptTrade}>Accept Trade</Button>
        <Button style={{ position: "absolute", right: "10%", top: "-18%", zIndex: 3, width: "10%", height: "18%" }} variant="secondary" onClick={cancelConsent}>Cancel</Button>

        <Row className="m-0 p-0" style={{ flexGrow: 1, position: "sticky", left: 0, top: 0 }}>
          <Card className="justify-center text-center">
            <Row className="justify-center text-center m-0">
              <Col>
              </Col>
              <Col>
                <div className="text-primary">
                  Your properties
                </div>
              </Col>
              <Col className="m-0 p-0">
                <p className="text-info m-0 p-0" style={{ fontSize: "1.5vh" }}>
                  Right Click a property for more details
                </p>
              </Col>

            </Row>
            <Row className="justify-center text-center m-0">
              <div className="text-primary">
                Remaining after trade: {props.remainingMoney} <MoneyImgTag />
              </div>
            </Row>
          </Card>
        </Row>
        <Row className="m-0 p-0" style={{ flexGrow: 4, maxHeight: "75%" }}>
          <HorizontalPropertyWindow hoverPlacement={"top"} reverse={true} properties={props.properties}
            onPropertyClick={props.onPropertyClick} />
        </Row>
      </Col>
      <Col xs="2" className="mh-100">
        <Card className="h-100 p-2">
          <Form onSubmit={(e) => { props.onUpdateTradeMoney(moneyFormBox); e.preventDefault(); }} className="align-bottom">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Offer's Money</Form.Label>
              <Form.Control value={moneyFormBox}
                onChange={(e) => { setMoneyFormBox(e.target.value) }}
                type="number" placeholder="150" min="0" max="9999" step="1" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Change Offer's Money
            </Button>
          </Form>
        </Card>
      </Col>
    </Container>
  )
};

export function TradeOverlay(props: { state: UIState }) {

  if (!props.state.currentTrade)
    throw new Error("This should only be called when current state is defined")

  const userSocket = useUserSocket();
  const myUserName = userSocket.Username;
  const players = useGameState(e => e.players);

  var currentlyOfferedByMe: PropertyDeed[] | undefined = undefined;
  var currentlyOfferedMoneyByme: number | undefined = undefined;

  if (props.state.currentTrade.tradeInitiator === myUserName) {
    currentlyOfferedByMe = props.state.currentTrade.initiatorOffer.properties;
    currentlyOfferedMoneyByme = props.state.currentTrade.initiatorOffer.money;
  }

  if (props.state.currentTrade.tradeTarget === myUserName) {
    currentlyOfferedByMe = props.state.currentTrade.targetOffer.properties;
    currentlyOfferedMoneyByme = props.state.currentTrade.targetOffer.money;
  }

  var myIndex = players.findIndex((e) => e.name === myUserName);

  var remainingProperties: PropertyDeed[] | undefined = undefined;
  var remainingMoney: number | undefined = undefined;
  if (currentlyOfferedByMe !== undefined && myIndex !== -1 && currentlyOfferedMoneyByme !== undefined) {
    remainingMoney = players[myIndex].money - currentlyOfferedMoneyByme;
    remainingProperties = players[myIndex].properties.filter(
      (e => {
        if (currentlyOfferedByMe === undefined)
          return false;
        return !arrayContains(currentlyOfferedByMe.map(e => e.propertyID), e.propertyID)
      }
      )
    );
  }

  const changeTradeMoney = useCallback((tradeMoney: string) => {
    if (!currentlyOfferedByMe) {
      return;
    }
    var newOffer = { properties: Array.from(currentlyOfferedByMe), money: tradeMoney }
    userSocket.emit("trade-offer-set", newOffer);
  }, [currentlyOfferedByMe, userSocket])

  const offerProperty = useCallback((property: PropertyDeed) => {
    if (currentlyOfferedMoneyByme === undefined || currentlyOfferedByMe === undefined) {
      return;
    }

    var newProperties = Array.from(currentlyOfferedByMe);
    newProperties.push(property);
    var newOffer = { properties: newProperties, money: currentlyOfferedMoneyByme }
    userSocket.emit("trade-offer-set", newOffer);
  }, [currentlyOfferedMoneyByme, userSocket, currentlyOfferedByMe])

  const removePropertyFromOffer = useCallback((property: PropertyDeed) => {
    if (currentlyOfferedMoneyByme === undefined || currentlyOfferedByMe === undefined) {
      return;
    }

    var newProperties = Array.from(currentlyOfferedByMe).filter(e => e.propertyID !== property.propertyID);
    var newOffer = { properties: newProperties, money: currentlyOfferedMoneyByme }
    userSocket.emit("trade-offer-set", newOffer);
  }, [currentlyOfferedMoneyByme, userSocket, currentlyOfferedByMe])

  return (
    <>
      <Card style={{ width: "35vw", height: "30vh", position: "absolute", left: "10vw", top: "15vh", zIndex: 2 }} onContextMenu={(e) => { e.preventDefault() }}>
        <TradeDisplayWindowContainerless reverse={true} agreed={props.state.currentTrade.initiatorConsent}
          onPropertyClick={removePropertyFromOffer}
          topDisplay={`${props.state.currentTrade.tradeInitiator} receives:`} offer={props.state.currentTrade.initiatorOffer} />
      </Card>
      <Card style={{ width: "35vw", height: "30vh", position: "absolute", right: "10vw", top: "15vh" }}
        onContextMenu={(e) => { e.preventDefault() }}>
        <TradeDisplayWindowContainerless reverse={false} agreed={props.state.currentTrade.targetConsent}
          onPropertyClick={removePropertyFromOffer}
          topDisplay={`${props.state.currentTrade.tradeTarget} receives:`} offer={props.state.currentTrade.targetOffer} />
      </Card>

      {
        remainingProperties && remainingMoney !== undefined &&
        <Card style={{ width: "100vw", height: "30vh", position: "absolute", bottom: "0px", left: "0px", zIndex: 3 }} onContextMenu={(e) => { e.preventDefault() }}>
          <TraderPickWindow
            onPropertyClick={offerProperty}
            properties={remainingProperties} remainingMoney={remainingMoney} onUpdateTradeMoney={changeTradeMoney} />
        </Card>
      }

    </>
  )
}