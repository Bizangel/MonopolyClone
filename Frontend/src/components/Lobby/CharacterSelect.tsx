import { Canvas } from "@react-three/fiber";
import { PlayerCharacter } from "common/characterModelConstants";
import { characterToSprite } from "common/characterSprites";
import { Container, Col, Row, Card, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { LobbyCharacterModelPreview } from "./LobbyCharacterModelPreview";
import { useLobbyState } from "./lobbyState";
import checkmark from 'assets/icons/checkmark.svg'
// const CheckMark = (props: { maxHeight: string }) => (
//   <svg width="20px" maxHeight={props.maxHeight} height="20px" viewBox="0 0 48 48" version="1" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 48 48">
//     <polygon fill="#43A047" points="40.6,12.1 17,35.7 7.4,26.1 4.6,29 17,41.3 43.4,14.9" />
//   </svg>
// )
function LobbyCharacterCard(props: { character: PlayerCharacter, playerLock: string }) {
  var isLocked = props.playerLock !== "";
  var color = isLocked ? "lightgreen" : undefined;

  return (
    <Card className="my-3" style={{ maxHeight: "33%", backgroundColor: color, opacity: 0.7, border: "5px solid black" }}>
      {
        isLocked && <Card.Header className="h-25"
          style={{ color: "white", whiteSpace: "nowrap", overflow: "hidden" }}>
          {props.playerLock}</Card.Header>
      }

      <img className="h-100 w-100 p-0 overflow-hidden" src={characterToSprite.get(props.character)} alt=""></img>
    </Card>
  )
};

function LobbyPlayerDisplay() {
  const lobbyPlayers = useLobbyState(e => e.players);

  const isLocked = {}
  return (
    <Card style={{ position: "fixed", top: "10vh", left: "5vw", width: "20vw", height: "70vh" }}>
      <Card.Header>
        Players in Lobby
      </Card.Header>

      <Card.Body>
        <ListGroup>
          <ListGroupItem style={{ textAlign: "center", verticalAlign: "middle" }}>
            <span>works</span>
            <img src={checkmark} style={{ width: "20px", height: "20px", paddingBottom: "2px", verticalAlign: "middle" }} alt="" />
          </ListGroupItem>
        </ListGroup>
      </Card.Body>
    </Card >
  )
};

function LobbyUI() {
  return (
    <>
      <LobbyPlayerDisplay />

      <Button variant="success" style={{ position: "fixed", bottom: "25px", right: "25px" }}>
        Lock!
      </Button>

      <Container style={{ position: "fixed", top: "10vh", right: "10vw", width: "25vw", height: "70vh" }}>
        <Row className="g-4 h-100" >
          <Col xs="6" className="h-100">
            <LobbyCharacterCard character={PlayerCharacter.Car} playerLock="bizangel" />
            <LobbyCharacterCard character={PlayerCharacter.Hat} playerLock="jugberius" />
            <LobbyCharacterCard character={PlayerCharacter.Iron} playerLock="" />
          </Col>
          <Col xs="6" className="h-100">
            <LobbyCharacterCard character={PlayerCharacter.Ship} playerLock="elpene" />
            <LobbyCharacterCard character={PlayerCharacter.Thimble} playerLock="" />
            <LobbyCharacterCard character={PlayerCharacter.Wheelcart} playerLock="" />
          </Col>
        </Row>


      </Container>
    </>
  )
}

export function CharacterSelect() {
  return (
    <>
      <Canvas>
        <ambientLight intensity={0.4} color="white" />
        <pointLight position={[10, 10, 10]} color="white" />

        <LobbyCharacterModelPreview character={PlayerCharacter.Car} />
      </Canvas>
      <LobbyUI />
    </>
  )
}