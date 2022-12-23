import { useState, useCallback } from "react"
import PageCenteredGridContainer from "components/helpers/PageCenteredGridContainer"
import { useSocketEvent } from "hooks/useSocketEvent";
import { Button, Card, Form } from "react-bootstrap"
import { readCookie } from "common/common";
import { LobbyState, useLobbyState } from "./lobbyState";
import { CharacterSelect } from "./CharacterSelect";
import { useUserSocket } from "hooks/socketProvider";


function LobbyCardDiv() {
  const userSocket = useUserSocket();
  const [userLobbyPass, setUserLobbyPass] = useState("");
  const [lobbyJoinError, setLobbyJoinError] = useState("");

  useSocketEvent("lobby-join-fail", (msg: string) => {
    setLobbyJoinError(msg);
  })

  const attemptJoinlobby = useCallback(() => {
    userSocket.emit("lobby-join", userLobbyPass);
  }, [userLobbyPass, userSocket])

  return (
    <PageCenteredGridContainer childWidth="30vw" childHeight="40vh">
      <Card style={{ width: "100%", height: "100%" }}>


        <Card.Title style={{ padding: "20px 0px 0px 20px" }}>Join Lobby</Card.Title>
        <Card.Body>
          <Card.Text>
            To join the lobby you'll require the lobby password:
          </Card.Text>


          <Form.Group className="mb-3" controlId="formBasicLobbyPassword">
            <Form.Label>Lobby Password</Form.Label>
            <Form.Control type="code" placeholder="Enter Code"
              name="code"
              value={userLobbyPass}
              onChange={
                (event) => { setUserLobbyPass(event.target.value) }
              } />
          </Form.Group>

          <Button variant="primary" onClick={attemptJoinlobby}>
            Join Lobby!
          </Button>

          <Card.Text style={{ color: "red" }}>{lobbyJoinError}</Card.Text>
        </Card.Body>
      </Card>
    </PageCenteredGridContainer>
  )
}


export function LobbyPage() {
  const [isCharacterSelect, setCharacterSelect] = useState(false);
  const updateLobbyState = useLobbyState(e => e.updateLobbyState);

  useSocketEvent("lobby-update", (payload: LobbyState) => {
    console.log("Lobby Update!: ", payload);
    // if lobby update contains current player. Then he's in character selection.
    var userCookie = readCookie("Auth-User");
    if (userCookie == null) {
      throw new Error("Logged in but missing login cookie!")
    }

    if (payload.players.findIndex(e => e.name === userCookie) !== -1) {
      setCharacterSelect(true); // effectively in lobby
    } else {
      setCharacterSelect(false); // effectively, not in lobby
    }

    // update state
    updateLobbyState(payload);
  });

  if (isCharacterSelect)
    return <CharacterSelect />
  else
    return <LobbyCardDiv />
}