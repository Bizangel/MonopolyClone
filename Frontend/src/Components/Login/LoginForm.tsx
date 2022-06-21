import React from 'react';
import { Button } from 'react-bootstrap';
import { GameTicketSchema, GameTicket } from '../../Models';
import { MonopolyRequests } from '../../Requests';
import { UserSocket } from '../../SocketEvents';
import { PageCenteredGridContainer } from '../Helpers/PageCenteredGridContainer';
import { UserPassForm } from './UserPassForm';

export class LoginFormPage extends React.Component {

  state = {
    messageDispColor: "red",
    messageDisp: "",
  }

  socket: UserSocket | undefined;

  onSubmit = async (form: UserPassForm) => {
    var gameticket = await MonopolyRequests.requestSchema<GameTicket>("/RequestGameTicket", form.state, MonopolyRequests.RequestMethods.POST, GameTicketSchema);
    if (gameticket != null) {
      this.setState({ messageDisp: "Successful login!", username: "", password: "", messageDispColor: "green" });

      // perform ticket and all login logic
      var mySocket = new UserSocket(gameticket);

      mySocket.onReady(() => { console.log("I was called as an opening callback!") })

      mySocket.onClose(() => { console.log("I was called as a closing callback!") })

      mySocket.on("testEvent2", (payload: string) => { console.log("I shouldn't be called!") })
      mySocket.on("testEvent", (payload: string) => { console.log("I was called as sampleEvent callback!" + payload) })
      mySocket.on("testEvent", (payload: string) => { console.log("I was called as yet another callback!" + payload) })

      mySocket.Initialize();
      this.socket = mySocket;
    } else {
      this.setState({ messageDisp: "Invalid username or password" });
    }
  }

  debug = () => {
    if (this.socket !== undefined) {
      this.socket.emit("sampleEvent", "Hello World!");
    } else {
      console.log("socket is undefined");
    }
  }

  render() {
    return (
      <PageCenteredGridContainer childWidth='20vw' childHeight='40vh'>
        <UserPassForm onSubmit={this.onSubmit} messageDisp={this.state.messageDisp} messageDispColor={this.state.messageDispColor} />
        <Button onClick={this.debug}>TestEvent</Button>
      </PageCenteredGridContainer>
    );

  }

}