import PageCenteredGridContainer from "components/helpers/PageCenteredGridContainer"
import { Card } from "react-bootstrap"


function LobbyCardDiv() {
  return (
    <PageCenteredGridContainer childWidth="30vw" childHeight="40vh">
      <Card style={{ width: "100%", height: "100%" }}>
        <Card.Title style={{ padding: "20px 0px 0px 20px" }}>MonopolyClone Lobby</Card.Title>
        <Card.Body>


          Choice to how it works.
        </Card.Body>

        <Card.Footer>cool footer</Card.Footer>
      </Card>
    </PageCenteredGridContainer>
  )
}


export function LobbyPage() {

  return (
    <LobbyCardDiv />
    // <div>
    //   cool lobby page go brrr
    // </div>
  )
}