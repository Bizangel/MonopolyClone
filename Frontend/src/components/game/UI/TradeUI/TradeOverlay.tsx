import { MoneyImgTag } from "common/common"
import { useRef, useState } from "react"
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"
import { HorizontalPropertyWindow } from "./HorizontalPropertyDisplay"


function TradeDisplayWindowContainerless(props: { reverse?: boolean }) {
  const scrollRef = useRef(null);

  return (
    <Container className="m-0 p-0 d-flex flex-column g-0" style={{ width: "100%", height: "100%", overflowX: "auto" }} ref={scrollRef}>
      <Row className="m-0 p-0" style={{ flexGrow: 1, position: "sticky", left: 0, top: 0 }}>
        <Card className="justify-center text-center">
          <Row className="justify-center text-center m-0">
            <div>
              bizangel's Offer
            </div>
          </Row>
          <Row className="justify-center text-center m-0">
            <div>
              130 <MoneyImgTag /> +
            </div>
          </Row>
        </Card>
      </Row>
      <Row className="m-0 p-0" style={{ flexGrow: 4, maxHeight: "75%" }}>
        <HorizontalPropertyWindow scrollRef={scrollRef} reverse={props.reverse} />
      </Row>
    </Container>
  )
};

function TraderPickWindow() {
  const scrollRef = useRef(null);

  const [moneyFormBox, setMoneyFormBox] = useState("");

  const updateTradeMoney = () => {
    console.log("new trade moeny: ", moneyFormBox);
  }

  return (
    <Container className="m-0 p-0 d-flex flex-row g-0 mw-100 mh-100">
      <Button style={{ position: "absolute", left: 0, top: 0, zIndex: 3 }} variant="danger">Cancel Trade</Button>

      <Col className="m-0 p-0 d-flex flex-column" style={{ width: "100%", overflowX: "scroll" }} ref={scrollRef}>
        <Row className="m-0 p-0" style={{ flexGrow: 1, position: "sticky", left: 0, top: 0 }}>
          <Card className="justify-center text-center">
            <Row className="justify-center text-center m-0">
              <Col>
              </Col>
              <Col>
                <div>
                  Your properties
                </div>
              </Col>
              <Col className="m-0 p-0">
                <p className="text-muted m-0 p-0" style={{ fontSize: "1.5vh" }}>
                  Right Click a property for more details
                </p>
              </Col>

            </Row>
            <Row className="justify-center text-center m-0">
              <div>
                Remaining after trade: 1240 <MoneyImgTag />
              </div>
            </Row>
          </Card>
        </Row>
        <Row className="m-0 p-0" style={{ flexGrow: 4, maxHeight: "75%" }}>
          <HorizontalPropertyWindow scrollRef={scrollRef} hoverPlacement={"top"} reverse={true} />
        </Row>
      </Col>
      <Col xs="2" className="mh-100">
        <Card className="h-100 p-2">
          <Form onSubmit={(e) => { updateTradeMoney(); e.preventDefault(); }}>
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

export function TradeOverlay() {

  return (
    <>
      <Card style={{ width: "35vw", height: "30vh", position: "absolute", left: "10vw", top: "15vh", zIndex: 2 }} >
        <TradeDisplayWindowContainerless reverse={true} />
      </Card>
      <Card style={{ width: "35vw", height: "30vh", position: "absolute", right: "10vw", top: "15vh" }} >
        <TradeDisplayWindowContainerless />
      </Card>

      <Card style={{ width: "100vw", height: "30vh", position: "absolute", bottom: "0px", left: "0px" }} >
        <TraderPickWindow />
      </Card>
    </>
  )
}