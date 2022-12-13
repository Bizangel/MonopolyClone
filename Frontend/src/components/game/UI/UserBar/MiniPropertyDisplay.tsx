import { NProperties, colorsToHex, propertyToColor } from "common/propertyConstants";
import React from "react";
import { Col, Container, Row } from "react-bootstrap"
import OverlayTrigger, { OverlayTriggerProps } from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';



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

// export type MiniPropertyDisplayProps = {
//   ownedProperties: number[],
// }

function CardEntry(props: { color: string | undefined, key: string }) {
  if (props.color)
    return <div className="rounded-1" style={{ height: "25%", backgroundColor: props.color }} onClick={() => { console.log("clicked at all?") }}></div>

  return (
    <div className="rounded-1 invisible" style={{ height: "25%" }}></div>
  )
}

function CardEntryWithHover(props: { color: string | undefined, idkey: string }) {
  return (
    // <OverlayTrigger
    //   onEntered={() => console.log("callback displayed...?")}
    //   trigger={["hover", "focus", "click"]}
    //   placement={"bottom"}
    //   overlay={
    //     <Popover id={`popover-positioned-top`}>
    //       <Popover.Header as="h3">{`Popover Top}`}</Popover.Header>
    //       <Popover.Body>
    //         <strong>Holy guacamole!</strong> Check this info.
    //       </Popover.Body>
    //     </Popover>
    //   }
    // >
    //   <CardEntry key={props.idkey} color={props.color} />
    // </OverlayTrigger>
    <CardEntry key={props.idkey} color={props.color} />
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
// export function MiniPropertyDisplay() {
//   return (
//     <Container className="w-100 h-100 m-0 p-0">
//       <Row className="w-100 h-100 m-0 p-0">
//         {/* First Row of cards. Brown */}
//         <Col className="m-0 p-0">
//           <div className="rounded-1" style={{ height: "25%", backgroundColor: "brown" }}></div>
//           <div className="rounded-1" style={{ height: "25%", backgroundColor: "brown" }}></div>
//           <div className="rounded-1" style={{ height: "25%", backgroundColor: "brown" }}></div>
//           <div className="rounded-1" style={{ height: "25%", backgroundColor: "brown" }}></div>
//           {/* <Row className="m-0 p-0 h-33 w-100" />
//           <Row className="m-0 p-0 h-33 w-100" />
//           <Row className="m-0 p-0 h-33 w-100" /> */}
//         </Col>
//         {/* Second Row of Cards. Light blue */}
//         <Col className="m-0 p-0">
//           <div className="rounded-1" style={{ height: "25%", backgroundColor: "blue" }}></div>
//         </Col>
//         {/* Third row of cards. Pink */}
//         <Col className="m-0 p-0">
//         </Col>
//         {/* Fourth row of cards. Orange */}
//         <Col className="m-0 p-0">
//         </Col>
//         {/* Fifth row of cards. Red */}
//         <Col className="m-0 p-0">
//         </Col>
//         {/* Sixth row of cards yellow*/}
//         <Col className="m-0 p-0">
//         </Col>
//         {/* Seventh row of cards. Green */}
//         <Col className="m-0 p-0">
//         </Col>
//         {/* Eigth row of cards. Deep blue */}
//         <Col className="m-0 p-0">
//         </Col>
//         {/* Ninth row of cards. Transports */}
//         <Col className="m-0 p-0">
//         </Col>
//         {/* Tenth row of cards. Services¿ */}
//         <Col className="m-0 p-0">
//         </Col>
//       </Row>
//     </Container>
//   )
// }