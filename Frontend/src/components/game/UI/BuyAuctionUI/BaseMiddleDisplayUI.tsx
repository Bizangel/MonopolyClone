import { Col, Container, Row } from "react-bootstrap"

export function BaseMiddleDisplayUI(props:
  { upper?: React.ReactNode, middle?: React.ReactNode, below?: React.ReactNode, right?: React.ReactNode }) {
  return (
    <Container className="p-0 m-0 mw-100 mh-100" style={{ width: "100vw", height: "100vh" }}>
      <Row className="w-100 h-100 m-0 p-0">
        <Col className="h-100 m-0 p-0" xs="4">
        </Col>
        <Col className="h-100 m-0 p-0" xs="4" style={{ pointerEvents: "auto" }}>
          <Row className="h-25 align-items-end justify-content-center">
            {props.upper}
          </Row>
          <Row className="h-50 w-100 p-0 m-0" >
            {props.middle}
          </Row>
          <Row className="mt-3 w-100 justify-content-center m-0 p-0">
            {props.below}
          </Row>
        </Col>
        <Col className="h-100 m-0 p-0" xs="4">
          {props.right}
        </Col>
      </Row >
    </Container >
  )
}