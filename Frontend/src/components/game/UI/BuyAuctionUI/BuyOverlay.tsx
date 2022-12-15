import { Button, Col, Container, Row } from "react-bootstrap"
import moneyimg from "assets/moneysprite_small.png"
import { propertyIDToImgpath } from "common/cardImages"



export function BuyOverlay(props: { price: number, propertyID: number, enabled: boolean }) {
  return (
    <Container className="p-0 m-0 mw-100 mh-100" style={{ width: "100vw", height: "100vh" }}>
      <Row className="w-100 h-100 m-0 p-0">
        <Col className="h-100 m-0 p-0" xs="4">
        </Col>
        <Col className="h-100 m-0 p-0" xs="4" style={{ pointerEvents: "auto" }}>
          <Row className="h-25 align-items-end justify-content-center">
            <p className="text-justify text-center text-primary"
              style={{ fontSize: "3vh" }}>Price: {props.price}

              <img className="rounded float-left img-fluid mw-100 mh-100"
                style={{ width: "20px", height: "10px" }}
                src={moneyimg} alt=""></img></p>
          </Row>
          <Row className="h-50 w-100 p-0 m-0" >
            <img className="rounded" style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
              src={propertyIDToImgpath.get(props.propertyID)} alt=""></img>
          </Row>
          <Row className="mt-3 w-100 justify-content-center">
            <Col xs="3">
              <Button disabled={!props.enabled}>Purchase Property</Button>
            </Col>
            <Col xs="3">
              <Button disabled={!props.enabled} variant="warning">Auction Property </Button>
            </Col>
          </Row>
        </Col>
        <Col className="h-100 m-0 p-0" xs="4">
        </Col>
      </Row >
    </Container >
  )
}