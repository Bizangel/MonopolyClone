import React from "react";
import { Card, Col, Container, ListGroup, Row } from "react-bootstrap";
import { motion } from "framer-motion"
import { characterToSprite } from "common/characterSprites";
import { PlayerCharacter } from "common/characterModelConstants";
import { MiniPropertyDisplay } from "./MiniPropertyDisplay";
import { PropertyDeed, useGameState } from "gameState/gameState";
import { AnimatedNumberDiv } from "components/helpers/AnimatedNumberDiv";
import { MoneyImgTag } from "common/common";
import { ContextMenu } from "./CustomContextMenu";
import { useUserSocket } from "hooks/socketProvider";
import DCIcon from "assets/icons/dc-icon.svg"

export type UserBarProps = {
  username: string,
  character: PlayerCharacter
  money: string,
  ownedProperties: PropertyDeed[],
  isPlayerTurn?: boolean,
  isDced: boolean,
  disablePropertyAnimate?: boolean,
};

const MotionCard = motion(Card);

export function UserBar(props: UserBarProps) {
  var color = props.isPlayerTurn ? "#f1d397" : undefined
  const outwardTurnClass = props.isPlayerTurn ? "20px" : "0px"

  const userSocket = useUserSocket();

  var displayTrade = userSocket.Username !== props.username; // cannot trade with itself

  const startTrade = () => {
    userSocket.emit("start-trade", props.username);
  };


  if (props.isDced)
    color = "#d61111"

  return (
    <ContextMenu elements={displayTrade ? [{ text: "Trade", onClick: startTrade }] : []}>
      <MotionCard
        whileHover={{ opacity: 1 }}
        style={{ width: "300px", height: "7vh", opacity: 0.8 }}
        transition={{
        }}
        animate={{
          backgroundColor: color,
          marginLeft: outwardTurnClass
        }}
      >
        <Container className="mw-100 mh-100 m-0 p-0" >
          <Row className="w-100 h-100 m-0 p-0">
            {/* Image display */}
            <Col className="h-100 me-0 pe-0" xs="3">
              {
                props.isDced &&
                <img src={DCIcon}
                  style={{
                    left: -110, top: -5, position: "absolute", width: "100%", height: "100%",
                    filter: "invert(62%) sepia(37%) saturate(1122%) hue-rotate(348deg) brightness(92%) contrast(89%)"
                  }}
                  alt="disconnected"></img>
              }

              <img className="rounded float-left img-fluid h-100" src={characterToSprite.get(props.character)} alt=""></img>
            </Col>
            {/* User name and money display */}
            <Col className="h-100 mw-100" xs="4">
              <Row className="h-30 align-items-center text-primary"
                style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {props.username}
              </Row>
              <Row className="h-70">
                <Col className="float-right m-0 p-0 text-primary" align="right" xs="5"
                  style={{ whiteSpace: "nowrap" }}>
                  <AnimatedNumberDiv value={parseInt(props.money)} />
                </Col>
                <Col className="p-0 m-0 align-items-center justify-content-center" xs="6">
                  <MoneyImgTag />
                </Col>
              </Row>
            </Col>
            {/* User property display */}
            <Col className="h-100 m-0 p-0" xs="5">
              <MiniPropertyDisplay ownedProperties={props.ownedProperties} disablePropertyAnimation={props.disablePropertyAnimate} />
            </Col>
          </Row>
        </Container>
      </MotionCard>
    </ContextMenu>
  )
}

export function MultipleUserBars() {

  const connectionUpkeep = useGameState(e => e.uiState.connectedUpkeep)
  const players = useGameState(e => e.players);
  const currentTurn = useGameState(e => e.currentTurn);


  return (
    <ListGroup>
      {
        players.map((player, i) =>
          <UserBar username={player.name} money={player.money.toString()}
            isPlayerTurn={i === currentTurn}
            isDced={!connectionUpkeep[i]}
            character={player.character} ownedProperties={player.properties} key={player.name} />
        )
      }
    </ListGroup>
  )
}