import { Button, Card, Col, OverlayTrigger, Tooltip } from "react-bootstrap"
import { propertyIDToImgpath } from "common/cardImages"
import { useUserSocket } from "hooks/socketProvider"
import { BaseMiddleDisplayUI } from "./BaseMiddleDisplayUI"
import { MoneyImgTag } from "common/common"

export function BuyOverlay(props: { price: number, propertyID: number, enabled: boolean, canPay: boolean }) {
  const userSocket = useUserSocket()

  const purchaseProperty = () => {
    userSocket.emit("property-choice", "buy"); // buy
  };

  const auctionProperty = () => {
    userSocket.emit("property-choice", "auction"); // auction
  };

  var hideTooltip = props.canPay ? "invisible" : "";

  return (
    <BaseMiddleDisplayUI
      upper={
        <Card style={{ width: "50%" }}>
          <p className="text-justify text-center text-primary"
            style={{ fontSize: "3vh" }}>Price: {props.price}

            <MoneyImgTag />
          </p>
        </Card >
      }
      middle={<img className="rounded" style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
        src={propertyIDToImgpath.get(props.propertyID)} alt=""></img>}

      below={
        <>
          <Col xs="3">
            <OverlayTrigger
              placement="left"
              trigger={["focus", "hover"]}
              overlay={
                <Tooltip className={hideTooltip}>
                  {!props.canPay &&
                    <i>Not Enough Money</i>
                  }
                </Tooltip>
              }
            >
              <span>
                <Button disabled={!props.enabled || !props.canPay} onClick={purchaseProperty}>Purchase Property</Button>
              </span>
            </OverlayTrigger>
          </Col>
          <Col xs="3">
            <Button disabled={!props.enabled} onClick={auctionProperty} variant="warning">Auction Property </Button>
          </Col>
        </>
      }
    />
  )
}