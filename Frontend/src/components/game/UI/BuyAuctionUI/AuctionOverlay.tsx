import samplecard from "assets/cards/card1.png"
import { PlayerCharacter } from "common/characterModelConstants"
import { characterToSprite } from "common/characterSprites"
import { AnimatedNumberFramerMotion } from "components/helpers/AnimatedNumberDiv"
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"
import moneyimg from "assets/moneysprite_small.png"
import { motion } from "framer-motion"

// export function BuyOverlay() {
//   return (
//     <Container className="p-0 m-0 mw-100 mh-100" style={{ width: "100vw", height: "100vh" }}>
//       <Row className="w-100 h-100 m-0 p-0">
//         <Col className="h-100 m-0 p-0" xs="4">
//         </Col>
//         <Col className="h-100 m-0 p-0" xs="4">
//           <Row className="h-25 align-items-end justify-content-center">
//             <p className="text-justify text-center" style={{ fontSize: "3vh" }}> Price: 100</p>
//           </Row>
//           <Row className="h-50 w-100 p-0 m-0">
//             <img className="rounded" style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }} src={samplecard} alt=""></img>
//           </Row>
//           <Row className="mt-3 w-100 justify-content-center">
//             <Col xs="3">
//               <Button>Purchase Property</Button>
//             </Col>
//             <Col xs="3">
//               <Button variant="warning">Auction Property </Button>
//             </Col>
//           </Row>
//         </Col>
//         <Col className="h-100 m-0 p-0" xs="4">
//         </Col>
//       </Row >


//     </Container >

//   )
// }


const MotionCard = motion(Card);

function PlayerBidDisplay(props: { isHighest: boolean }) {
  var highestBidder = props.isHighest;
  const color = highestBidder ? "#f1d397" : undefined;
  const outwardTurn = highestBidder ? "30px" : "0px";

  return (
    <MotionCard
      whileHover={{ opacity: 1 }}
      style={{ width: "300px", height: "7vh", opacity: 0.8, overflowX: "visible", position: "relative" }}
      animate={{
        backgroundColor: color,
        right: outwardTurn,
      }}
    >
      <Container className="mw-100 mh-100 m-0 p-0" >
        <Row className="w-100 h-100 m-0 p-0">
          <Col className="h-100 me-0 pe-0" xs="3">
            <img className="rounded float-left img-fluid h-100" src={characterToSprite.get(PlayerCharacter.Car)} alt=""></img>
          </Col>
          <Col className="h-100 mw-100" xs="9">
            <Row className="h-30 align-items-center"
              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {"something"}
            </Row>
            <Row className="h-70">
              <Col xs="2" className="m-0 p-0" align="left">
                Bid:
              </Col>
              <Col className="p-0 m-0 align-items-center justify-content-center float-left" align="left" xs="4">
                <AnimatedNumberFramerMotion value={300} />
                <img className="rounded float-left img-fluid mw-100 mh-100"
                  style={{ width: "20px", height: "10px" }}
                  src={moneyimg} alt=""></img>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </MotionCard>
  )
};

export function AuctionOverlay() {
  return (
    <Container className="p-0 m-0 mw-100 mh-100" style={{ width: "100vw", height: "100vh" }}>
      <Row className="w-100 h-100 m-0 p-0">
        <Col className="h-100 m-0 p-0" xs="4">
        </Col>
        <Col className="h-100 m-0 p-0" xs="4">
          <Row className="h-25 align-items-end justify-content-center">
            <div style={{ width: "100%", height: "25%" }}>
              <div>Selling to bizangel in 10.0</div>
              <div style={{ width: "32%", height: "25%", backgroundColor: "yellow" }}></div>
            </div>
            <p className="text-justify text-center text-primary"
              style={{ fontSize: "3vh" }}>Highest Bid: <AnimatedNumberFramerMotion value={200} />

              <img className="rounded float-left img-fluid mw-100 mh-100"
                style={{ width: "20px", height: "10px" }}
                src={moneyimg} alt=""></img></p>
          </Row>
          <Row className="h-50 w-100 p-0 m-0">
            <img className="rounded" style={{ width: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%", margin: "auto" }} src={samplecard} alt=""></img>
          </Row>
          <Row className="mt-3 w-100 justify-content-center">
            <Col xs="3" className="d-flex w-100 justify-content-center">
              <Form.Control
                className="is-invalid" // use this to display that bid is too low
                type="number" placeholder="150" min="0" step="1" max="9999"
                style={{
                  width: "50%"
                }} />
            </Col>
          </Row>
          <Row className="mt-3 w-100 justify-content-center">
            <Button style={{ width: "50%" }} variant="primary">Place Bid</Button>
          </Row>
        </Col>
        <Col className="d-flex h-100 m-0 p-0 align-items-center mw-100 mh-100" xs="4">

          <Row className="m-0 p-0 mw-100 mh-100" >
            <PlayerBidDisplay isHighest={true} />
            <PlayerBidDisplay isHighest={false} />
          </Row>

        </Col>
      </Row >


    </Container >

  )
}
