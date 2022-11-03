import { Card, Col, Container, ListGroup, Row } from "react-bootstrap";

import moneyimg from "assets/moneysprite_small.png"
import { characterToSprite } from "common/characterSprites";
import { PlayerCharacter } from "common/characterModelConstants";
import { MiniPropertyDisplay } from "./MiniPropertyDisplay";

export type UserBarProps = {
  username: string,
  character: PlayerCharacter
  money: string,
  ownedProperties: number[],
};

export function UserBar(props: UserBarProps) {
  return (
    <Card style={{ opacity: 0.7, width: "30vw", height: "7vh", maxWidth: "300px", minWidth: "300px" }} className="opacity-100-hover">
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
  return (
    <ListGroup>
      <UserBar username="bizangel" money="100"
        character={PlayerCharacter.Car} ownedProperties={[19, 21, 22, 23, 24, 25, 26]} />
      <UserBar username="AAAAAAAAAAAAA 😋😋😋😋 😋😋😋" money="1500"
        character={PlayerCharacter.Hat} ownedProperties={[15, 16, 17, 18]} />
      <UserBar username="royalguti" money="1300" character={PlayerCharacter.Iron}
        ownedProperties={[6, 11, 12, 14]} />
      <UserBar username="Ironicfox" money="100" character={PlayerCharacter.Ship}
        ownedProperties={[3, 4, 5]} />
      <UserBar username="jugberius" money="800" character={PlayerCharacter.Wheelcart}
        ownedProperties={[0, 1, 21]} />
      <UserBar username="elgranteton" money="400" character={PlayerCharacter.Thimble}
        ownedProperties={[2, 7, 8, 9, 10, 13, 20, 27]} />
    </ListGroup>
  )
}