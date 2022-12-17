import { Button, Card, Col } from "react-bootstrap"
import moneyimg from "assets/moneysprite_small.png"
import { propertyIDToImgpath } from "common/cardImages"
import { useUserSocket } from "hooks/socketProvider"
import { BaseMiddleDisplayUI } from "./BaseMiddleDisplayUI"



export function BuyOverlay(props: { price: number, propertyID: number, enabled: boolean, canPay: boolean }) {
  const userSocket = useUserSocket()

  const purchaseProperty = () => {
    userSocket.emit("property-choice", "buy"); // buy
  };

  const auctionProperty = () => {
    userSocket.emit("property-choice", "auction"); // auction
  };

  return (
    <BaseMiddleDisplayUI
      upper={
        <Card style={{ width: "50%" }}>
          <p className="text-justify text-center text-primary"
            style={{ fontSize: "3vh" }}>Price: {props.price}

            <img className="rounded float-left img-fluid mw-100 mh-100"
              style={{ width: "20px", height: "10px" }}
              src={moneyimg} alt=""></img></p>
        </Card >
      }
      middle={<img className="rounded" style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
        src={propertyIDToImgpath.get(props.propertyID)} alt=""></img>}

      below={
        <>
          <Col xs="3">
            <Button disabled={!props.enabled || !props.canPay} onClick={purchaseProperty}>Purchase Property</Button>
          </Col>
          <Col xs="3">
            <Button disabled={!props.enabled} onClick={auctionProperty} variant="warning">Auction Property </Button>
          </Col>
        </>
      }
    />
  )
}