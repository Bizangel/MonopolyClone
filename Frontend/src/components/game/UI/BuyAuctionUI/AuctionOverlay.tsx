import { PlayerCharacter } from "common/characterModelConstants"
import { characterToSprite } from "common/characterSprites"
import { AnimatedNumberDiv } from "components/helpers/AnimatedNumberDiv"
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"
import { motion } from "framer-motion"
import { Auction } from "gameState/uiState"
import { useGameState } from "gameState/gameState"
import { useCallback, useState } from "react"
import { useUserSocket } from "hooks/socketProvider"
import Countdown, { CountdownRenderProps } from 'react-countdown';
import { propertyIDToImgpath } from "common/cardImages"
import { MoneyImgTag } from "common/common"

const MotionCard = motion(Card);

function PlayerBidDisplay(props:
  { username: string, bidAmount: number, isHighest: boolean, character?: PlayerCharacter }) {

  var highestBidder = props.isHighest;
  const color = highestBidder ? "#f1d397" : undefined;
  const outwardTurn = highestBidder ? "30px" : "0px";

  return (
    <MotionCard
      whileHover={{ opacity: 1 }}
      style={{ width: "300px", height: "7vh", opacity: 1 }}
      animate={{
        backgroundColor: color,
        right: outwardTurn,
      }}
    >
      <Container className="mw-100 mh-100 m-0 p-0" >
        <Row className="w-100 h-100 m-0 p-0">
          <Col className="h-100 me-0 pe-0" xs="3">
            <img className="rounded float-left img-fluid h-100"
              src={characterToSprite.get(props.character ? props.character : PlayerCharacter.Car)} alt=""></img>
          </Col>
          <Col className="h-100 mw-100" xs="9">
            <Row className="h-30 align-items-center text-primary"
              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {props.username}
            </Row>
            <Row className="h-70">
              <Col xs="2" className="m-0 p-0 text-primary" align="left">
                Bid:
              </Col>
              <Col className="p-0 m-0 align-items-center justify-content-center float-left text-primary" align="left" xs="4">
                <AnimatedNumberDiv value={props.bidAmount} durationSeconds={0.1} />
                <MoneyImgTag />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </MotionCard>
  )
};

const expectedDuration = 10000; // 10s in ms

export function AuctionOverlay(props: { auction: Auction }) {
  const players = useGameState(e => e.players);
  const [currentBidbox, setCurrentBidBox] = useState("");
  const userSocket = useUserSocket();

  var highestAuctioner = players[props.auction.topBid];
  var usernameToPlayer = new Map<string, PlayerCharacter>();
  players.forEach(e => {
    usernameToPlayer.set(e.name, e.character);
  });

  const placeBid = useCallback((e: any) => {
    var bid = Number(currentBidbox)
    if (!isNaN(bid))
      userSocket.emit("auction-place-bid", bid);

    e.preventDefault();
  }, [userSocket, currentBidbox]);

  const myCountDown = (props: CountdownRenderProps) => {
    var remainingPercent = (props.total / expectedDuration);

    var midPoint = 100 * remainingPercent;

    return (
      <div style={{ width: "100%", height: "25%" }}>
        <div className="text-info">Selling to {highestAuctioner.name} in {props.seconds}:{props.milliseconds}</div>
        <div style={{
          width: `${(remainingPercent * 100).toFixed(2)}%`, height: "25%",
          backgroundColor: `hsl(${midPoint}, 90%, 47%)`
        }}></div>
      </div>
    );
  }

  var highestBid = props.auction.bids[props.auction.topBid].bidAmount;

  return (
    <Container className="p-0 m-0 mw-100 mh-100" style={{ width: "100vw", height: "100vh", pointerEvents: "none" }}>
      <Row className="w-100 h-100 m-0 p-0">
        <Col className="h-100 m-0 p-0" xs="4">
        </Col>
        <Col className="h-100 m-0 p-0" xs="4" style={{ pointerEvents: "auto" }}>
          <Row className="h-25 align-items-end justify-content-center">
            <Countdown date={props.auction.currentAuctionDeadline} renderer={myCountDown} intervalDelay={50} precision={3} />
            <Card style={{ width: "50%" }}>
              <p className="text-justify text-center text-primary"
                style={{ fontSize: "3vh" }}>Highest Bid: <AnimatedNumberDiv
                  value={highestBid} durationSeconds={0.1} />

                <MoneyImgTag /></p>
            </Card>
          </Row>
          <Row className="h-50 w-100 p-0 m-0">
            <img className="rounded" style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
              src={propertyIDToImgpath.get(props.auction.auctionedProperty)} alt=""></img>
          </Row>
          <Form onSubmit={placeBid}>
            <Row className="mt-3 w-100 justify-content-center">
              <Col xs="3" className="d-flex flex-column w-100 align-items-center justify-content-center">
                <Form.Control
                  onChange={
                    (e) => {
                      if (e.target.value === "") {
                        setCurrentBidBox("");
                        return;
                      }

                      var myint = parseInt(e.target.value);
                      if (!isNaN(myint))
                        setCurrentBidBox(e.target.value);
                    }
                  }
                  value={currentBidbox}
                  type="number" placeholder={(highestBid + 1).toString()} min={highestBid} step="1" max="9999"
                  style={{
                    width: "50%"
                  }} />
              </Col>
            </Row>
          </Form>
          <Row className="mt-3 w-100 justify-content-center">
            <Button style={{ width: "50%" }} type="submit" variant="primary" onClick={placeBid}>Place Bid</Button>
          </Row>

        </Col>
        <Col className="d-flex flex-column h-100 m-0 p-0 align-items-center justify-content-center mw-100 mh-100" xs="4">
          <>
            {props.auction.bids.map((e) => {
              return (
                <PlayerBidDisplay username={e.bidder} bidAmount={e.bidAmount}
                  key={e.bidder}
                  character={usernameToPlayer.get(e.bidder)} isHighest={e.bidder === highestAuctioner.name} />
              )
            })}
          </>


        </Col>
      </Row >


    </Container >

  )
}
