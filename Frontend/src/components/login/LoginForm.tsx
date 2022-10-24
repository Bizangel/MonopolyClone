import React from 'react';
import { Card } from 'react-bootstrap';
import { LoginReply, LoginReplySchema, AuthForm } from 'schemas';
import { MonopolyRequests } from 'remote';
import PageCenteredGridContainer from 'components/helpers/PageCenteredGridContainer';
import { UserPassForm } from './UserPassForm';


type LoginFormProps = {
  onLoginSuccess: () => void,
  onRegisterClick: () => void,
}

export class LoginFormPage extends React.Component<LoginFormProps>{

  state = {
    messageDispColor: "red",
    messageDisp: "",
  }

  onSubmit = async (form: AuthForm) => {
    var loginreply = await MonopolyRequests.requestSchema<LoginReply>("/Login", form, MonopolyRequests.RequestMethods.POST, LoginReplySchema, true);
    if (loginreply == null) {
      this.setState({ messageDisp: "Connection Error!", username: "", password: "", messageDispColor: "red" });
    } else {
      if (loginreply.success) {
        this.setState({ messageDisp: "Successful login!", username: "", password: "", messageDispColor: "green" });
        this.props.onLoginSuccess();
      } else {
        this.setState({ messageDisp: "Invalid username or password", username: "", password: "", messageDispColor: "red" });
      }
    }
  }

  render() {
    return (
      <PageCenteredGridContainer childWidth='30vw' childHeight='40vh'>
        <Card style={{ width: "100%", height: "100%" }}>
          <Card.Title style={{ padding: "20px 0px 0px 20px" }}>Login to MonopolyClone!</Card.Title>
          <Card.Body>

            <UserPassForm
              onSubmit={this.onSubmit} messageDisp={this.state.messageDisp}
              messageDispColor={this.state.messageDispColor}
              title="Register to MonopolyClone!"
              passwordAutoComplete='current-password' />

          </Card.Body>

          <Card.Footer>Don't have an account? <Card.Link onClick={this.props.onRegisterClick} style={{ cursor: "pointer" }}>Register!</Card.Link></Card.Footer>
        </Card>
      </PageCenteredGridContainer>
    );

  }

}