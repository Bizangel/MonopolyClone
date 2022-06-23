import React from 'react';
import { Card } from 'react-bootstrap';
import { LoginReply, LoginReplySchema } from '../../Models';
import { MonopolyRequests } from '../../Requests';
import { UserSocket } from '../../SocketEvents';
import { PageCenteredGridContainer } from '../Helpers/PageCenteredGridContainer';
import { UserPassForm } from './UserPassForm';

type LoginFormProps = {
  goToRegister: () => void,
}

export class LoginFormPage extends React.Component<LoginFormProps>{

  state = {
    messageDispColor: "red",
    messageDisp: "",
  }

  socket: UserSocket | undefined;

  onSubmit = async (form: UserPassForm) => {
    var gameticket = await MonopolyRequests.requestSchema<LoginReply>("/Login", form.state, MonopolyRequests.RequestMethods.POST, LoginReplySchema, true);
    if (gameticket != null) {

      var mySocket = new UserSocket(form.state.username);
      this.setState({ messageDisp: "Successful login!", username: "", password: "", messageDispColor: "green" });

      // perform ticket and all login logic
      mySocket.onReady(() => { console.log("I was called as an opening callback!") })

      mySocket.onClose(() => { console.log("I was called as a closing callback!") })

      mySocket.on("testEvent", (payload: string) => { console.log("I was called as sampleEvent callback!" + payload) })
      mySocket.on("testEvent", (payload: string) => { console.log("I was called as yet another callback!" + payload) })

      mySocket.Initialize();
      this.socket = mySocket;
    } else {
      this.setState({ messageDisp: "Invalid username or password" });
    }
  }

  render() {
    return (
      <PageCenteredGridContainer childWidth='20vw' childHeight='40vh'>
        <Card style={{ width: "100%", height: "100%" }}>
          <Card.Title style={{ padding: "20px 0px 0px 20px" }}>Login to Biza's PanoGuessr!</Card.Title>
          <Card.Body>


            <UserPassForm
              onSubmit={this.onSubmit} messageDisp={this.state.messageDisp}
              messageDispColor={this.state.messageDispColor}
              title="Register to MonopolyClone!" />

          </Card.Body>

          <Card.Link href="#">Don't have an account? Register!</Card.Link>
        </Card>
      </PageCenteredGridContainer>
    );

  }

}