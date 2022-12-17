import { propertyIDToImgpath } from "common/cardImages";
import { NProperties, colorsToHex, propertyToColor } from "common/propertyConstants";
import React from "react";
import { Col, Container, Row } from "react-bootstrap"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { motion } from "framer-motion"

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

function CardEntryWithHover(props: { propID: number, color: string | undefined, idkey: string }) {
  if (props.color === undefined)
    return <div className="rounded-1 invisible" style={{ height: "25%" }}></div>

  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement={"bottom"}
      overlay={
        <Popover id={`popover-positioned-top`}>
          <img className="rounded float-left img-fluid mw-100 mh-100" src={propertyIDToImgpath.get(props.propID)} alt="PaseoPoblado" />
        </Popover>
      }
    >
      {/* <div className="rounded-1" style={{ height: "25%", backgroundColor: props.color }}></div> */}
      <motion.div className="rounded-1"
        style={{
          backgroundColor: props.color,

          borderStyle: "solid",
          borderColor: "#d7de12",
        }}
        transition={
          {
            borderWidth: { delay: 5 },
            default: { duration: 1.5, type: "ease-in" }
          }
        }
        initial={{
          opacity: 0.8,
          transform: "translate(40vw, 10vh)",
          height: "500%",
          width: "1000%",

          borderWidth: "3px",
        }}
        animate={
          {
            opacity: 1,
            transform: "translate(0vh, 0vw)",
            scale: 1,
            height: "25%",
            width: "100%",

            borderWidth: "0px",
          }
        }
      />
    </OverlayTrigger>
  )
}



export function MiniPropertyDisplay(props: { ownedProperties: number[] }) {
  const sections: React.ReactNode[] = [];

  var curPropID = 0;
  colorToCount.forEach((count, color) => {
    var entries = Array(count).fill(undefined).map(e => {
      var actualDisplaycolor: string | undefined = color;
      if (!props.ownedProperties.includes(curPropID)) {
        actualDisplaycolor = undefined;
      }
      curPropID++;
      return <CardEntryWithHover color={actualDisplaycolor}
        propID={curPropID - 1}
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
      <Row className="w-100 h-100 m-0 p-0">
        <>
          {sections}
        </>
      </Row>
    </Container>
  )
}