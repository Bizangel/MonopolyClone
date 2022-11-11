import { Card, Col, Container, ListGroup, Row } from "react-bootstrap";

import moneyimg from "assets/moneysprite_small.png"
import { characterToSprite } from "common/characterSprites";
import { PlayerCharacter } from "common/characterModelConstants";
import { MiniPropertyDisplay } from "./MiniPropertyDisplay";
import { useGameState } from "gameState/gameState";

export type UserBarProps = {
  username: string,
  character: PlayerCharacter
  money: string,
  ownedProperties: number[],
  isPlayerTurn?: boolean,
};

export function UserBar(props: UserBarProps) {
  const color = props.isPlayerTurn ? "#f1d397" : undefined
  const outwardTurnClass = props.isPlayerTurn ? "mx-3" : undefined
  return (
    <Card style={{
      opacity: 0.7, width: "300px", height: "7vh",
      backgroundColor: color,
    }} className={`opacity-100-hover ${outwardTurnClass}`}>
      <Container className="mw-100 mh-100 m-0 p-0">
        <Row className="w-100 h-100 m-0 p-0">
          {/* Image display */}
          <Col className="h-100 me-0 pe-0" xs="3">
            <img className="rounded float-left img-fluid h-100" src={characterToSprite.get(props.character)} alt=""></img>
          </Col>
          {/* User name and money display */}
          <Col className="h-100 mw-100" xs="4">
            <Row className="h-30 align-items-center"
              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {props.username}
            </Row>
            <Row className="h-70">
              <Col className="float-right m-0 p-0" align="right" xs="5"
                style={{ whiteSpace: "nowrap" }}>
                {props.money}
              </Col>
              <Col className="p-0 m-0 align-items-center justify-content-center" xs="6">
                <img className="rounded float-left img-fluid mw-100 mh-100"
                  style={{ width: "20px", height: "10px" }}
                  src={moneyimg} alt=""></img>
              </Col>
            </Row>
          </Col>
          {/* User property display */}
          <Col className="h-100 m-0 p-0" xs="5">
            <MiniPropertyDisplay ownedProperties={props.ownedProperties} />
          </Col>
        </Row>
      </Container>
    </Card>
  )
}

export function MultipleUserBars() {

  const players = useGameState(e => e.players);
  const currentTurn = useGameState(e => e.currentTurn);

  return (
    <ListGroup>
      {
        players.map((player, i) =>
          <UserBar username={player.name} money={player.money.toString()}
            isPlayerTurn={i === currentTurn}
            character={player.character} ownedProperties={[]} key={player.name} />
        )
      }
    </ListGroup>
  )
}