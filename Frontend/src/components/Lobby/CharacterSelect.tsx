import { Canvas } from "@react-three/fiber";
import { PlayerCharacter } from "common/characterModelConstants";
import { characterToSprite } from "common/characterSprites";
import { useUserSocket } from "hooks/socketProvider";
import { Container, Col, Row, Card, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { LobbyCharacterModelPreview } from "./LobbyCharacterModelPreview";
import { useLobbyState, useTemporaryLocalLobby } from "./lobbyState";

function LobbyCharacterCard(props: {
  character: PlayerCharacter,
}) {
  const lobbyPlayers = useLobbyState(e => e.players);
  const setPreview = useTemporaryLocalLobby(e => e.setPreview);
  const leavePreview = useTemporaryLocalLobby(e => e.removePreview);
  const setSelected = useTemporaryLocalLobby(e => e.setSelected);
  const selectedCharacter = useTemporaryLocalLobby(e => e.selected);

  var playerLock = "";
  var isSelected = selectedCharacter === props.character;

  lobbyPlayers.forEach((e => {
    if (e.character === props.character) {
      playerLock = e.name;
    }
  }))
  var isLocked = playerLock !== "";
  var color = isLocked ? "lightgreen" : undefined;

  const onHoverEnter = () => { setPreview(props.character); }
  const onHoverExit = () => { leavePreview(); }
  const onCardClick = () => { setSelected(props.character); }

  const borderColor = isSelected ? "green" : "black";

  return (
    <Card className="my-3" style={{
      maxHeight: "33%", backgroundColor: color, opacity: 0.7,
      border: `5px solid ${borderColor}`
    }}
      onMouseEnter={onHoverEnter} onMouseLeave={onHoverExit} onClick={onCardClick}
    >
      {
        isLocked && <Card.Header className="h-25"
          style={{ color: "white", whiteSpace: "nowrap", overflow: "hidden" }}>
          {playerLock}</Card.Header>
      }

      <img className="h-100 w-100 p-0 overflow-hidden" src={characterToSprite.get(props.character)} alt=""></img>
    </Card>
  )
};

function LobbyPlayerDisplay() {
  const lobbyPlayers = useLobbyState(e => e.players);
  return (
    <Card style={{ position: "fixed", top: "10vh", left: "5vw", width: "20vw", height: "70vh" }}>
      <Card.Header>
        Players in Lobby
      </Card.Header>
      <Card.Body>
        <ListGroup>
          <>
            {lobbyPlayers.map(e =>
              <ListGroupItem key={e.name} style={
                { backgroundColor: e.character ? "lightgreen" : undefined }
              }>
                {e.name}
              </ListGroupItem>
            )}
          </>
        </ListGroup>
      </Card.Body>
    </Card >
  )
};

function LobbyUI() {
  const selectedUser = useTemporaryLocalLobby(e => e.selected);
  const userSocket = useUserSocket();

  const onLock = () => {
    userSocket.emit("lobby-lock", selectedUser);
  };

  return (
    <>
      <LobbyPlayerDisplay />

      <Button variant="success"
        onClick={onLock}
        style={{ position: "fixed", bottom: "25px", right: "25px" }}>
        Lock!
      </Button>

      <Container style={{ position: "fixed", top: "10vh", right: "10vw", width: "25vw", height: "70vh" }}>
        <Row className="g-4 h-100" >
          <Col xs="6" className="h-100">
            <LobbyCharacterCard character={PlayerCharacter.Car} />
            <LobbyCharacterCard character={PlayerCharacter.Hat} />
            <LobbyCharacterCard character={PlayerCharacter.Iron} />
          </Col>
          <Col xs="6" className="h-100">
            <LobbyCharacterCard character={PlayerCharacter.Ship} />
            <LobbyCharacterCard character={PlayerCharacter.Thimble} />
            <LobbyCharacterCard character={PlayerCharacter.Wheelcart} />
          </Col>
        </Row>


      </Container>
    </>
  )
}


export function CharacterSelect() {
  const preview = useTemporaryLocalLobby(e => e.preview);

  return (
    <>
      <Canvas>
        <ambientLight intensity={0.4} color="white" />
        <pointLight position={[10, 10, 10]} color="white" />

        <LobbyCharacterModelPreview character={preview} />
      </Canvas>
      <LobbyUI />
    </>
  )
}