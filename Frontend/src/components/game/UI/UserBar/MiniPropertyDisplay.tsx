import { Col, Container, Row } from "react-bootstrap"

export type OwnedProperties = {

}

// properties are IDs from 0-27
// 0-1 is brown, 2-3 is lightblue, 3-4 is pink and so on.
// 22-25 are railroad services
// 26-27 is services

// const colors = ["brown", "lightblue", "pink", "orange", "red", "yellow", "green", "blue", "black", "gray"]
const colors = ["#997462", "#adddf5", "#c33c82", "#f08e30", "#dd2328", "#fff100", "#18a966", "#0066a4", "#4b413f", "#a8a6af"]
export function MiniPropertyDisplay() {

  const cardEntry = (color: string, percent: number) => (
    <div className="rounded-1" style={{ height: `${percent}%`, backgroundColor: color }}></div>
  );

  const sections = colors.map((color) => {
    var entries = Array(4).fill(undefined).map(e => cardEntry(color, 25))
    console.log(entries)
    return (
      <Col className="m-0 p-0">
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