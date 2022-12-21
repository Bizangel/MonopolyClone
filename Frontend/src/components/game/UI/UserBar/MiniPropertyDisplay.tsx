import { propertyIDToImgpath } from "common/cardImages";
import { NProperties, colorsToHex, propertyToColor } from "common/propertyConstants";
import React, { useRef } from "react";
import { Col, Container, Row } from "react-bootstrap"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { motion } from "framer-motion"
import { PropertyDeed } from "gameState/gameState";
import { HouseImgTag, MoneyImgTag } from "common/common";
import { propertyIDToPrice } from "common/propertiesMapping";
import LockSVG from "assets/icons/lock-icon.svg"

// only needs to be calculated once really
var colorToCount = new Map<string, number>();
for (const propID of Array(NProperties).keys()) {
  var color = colorsToHex.get(propertyToColor(propID));
  if (color === undefined)
    throw new Error(`Property ID ${propID} didn't resolve to a color.`)
  var count = colorToCount.get(color);
  if (count === undefined)
    count = 0;

  colorToCount.set(color, count + 1);
}

function CardEntryWithHover(props: {
  propID: number, color: string | undefined, idkey: string,
  upgradeState?: number,
  containerRef?: React.RefObject<HTMLElement>,
  disablePropertyAnimate?: boolean,
}) {

  if (props.color === undefined)
    return <div className="rounded-1 invisible" style={{ height: "25%" }}></div>

  var color = propertyToColor(props.propID);
  var toDisplayUpgrade = color !== "black" && color !== "gray";

  var isMortgaged = props.upgradeState === -1;
  var mortgageFilter = isMortgaged ? "brightness(50%)" : ""


  var initialAnimationStart = {
    opacity: 0.8,
    transform: "translate(40vw, 10vh)",
    height: "500%",
    width: "1000%",

    borderWidth: "3px",
  }

  var animateTo = {
    opacity: 1,
    transform: "translate(0vh, 0vw)",
    scale: 1,
    height: "25%",
    width: "100%",

    borderWidth: "0px",
  }

  if (props.disablePropertyAnimate) {
    initialAnimationStart = animateTo;
  }

  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement={"bottom"}
      container={props.containerRef}
      overlay={
        <Popover id={`popover-positioned-top`}>

          {
            toDisplayUpgrade && !isMortgaged &&
            <p className="text-justify text-center text-primary">
              {`Upgrade: ${props.upgradeState} `} <HouseImgTag />
            </p>
          }

          <p className="text-justify text-center text-primary">Base Cost: {propertyIDToPrice.get(props.propID)}
            <MoneyImgTag />
          </p>
          {isMortgaged && <i>This property is mortgaged</i>}
          <img style={{ filter: mortgageFilter }}
            className="rounded float-left img-fluid mw-100 mh-100" src={propertyIDToImgpath.get(props.propID)} alt="PaseoPoblado" />
        </Popover>
      }
    >
      <motion.div className="rounded-1"
        style={{
          backgroundColor: props.color,
          margin: "0 0 0 0",
          padding: "0 0 0 0",
          borderStyle: "solid",
          borderColor: "#d7de12",
        }}
        transition={
          {
            borderWidth: { delay: 5 },
            default: { duration: 1.5, type: "ease-in" }
          }
        }
        initial={initialAnimationStart}
        animate={animateTo}
      >
        {
          props.upgradeState !== undefined && props.upgradeState === -1 &&
          <img src={LockSVG} style={{ width: "70%", position: "absolute", left: "15%" }} alt=""></img>
        }

      </motion.div>

    </OverlayTrigger >
  )
}

export function MiniPropertyDisplay(props: { ownedProperties: PropertyDeed[], disablePropertyAnimation?: boolean }) {
  const sections: React.ReactNode[] = [];

  const ref = useRef<HTMLDivElement>(null);

  var curPropID = 0;
  colorToCount.forEach((count, color) => {
    var entries = Array(count).fill(undefined).map(e => {
      var actualDisplaycolor: string | undefined = color;

      var ownedProperty = props.ownedProperties.find(e => e.propertyID === curPropID);
      var upgrade: number | undefined = undefined;
      if (ownedProperty === undefined) {
        actualDisplaycolor = undefined;
      } else {
        upgrade = ownedProperty.upgradeState;
      }
      // if (!props.ownedProperties.map(j => j.propertyID).includes(curPropID)) {
      //   actualDisplaycolor = undefined;
      // }


      curPropID++;
      return <CardEntryWithHover color={actualDisplaycolor}
        disablePropertyAnimate={props.disablePropertyAnimation}
        containerRef={ref}
        propID={curPropID - 1}
        upgradeState={upgrade}
        idkey={"tooltip-" + curPropID.toString()} key={`card-entry-${curPropID}`} />
    })

    sections.push(
      <Col key={"section" + color} className="m-0 p-0">
        <>
          {entries}
        </>
      </Col>
    )
  })

  return (
    <Container className="w-100 h-100 m-0 p-0">
      <Row className="w-100 h-100 m-0 p-0" ref={ref}>
        <>
          {sections}
        </>
      </Row>
    </Container>
  )
}