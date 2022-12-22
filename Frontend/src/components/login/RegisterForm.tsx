import React from 'react';
import { Card } from 'react-bootstrap';
import { RegisterReply, RegisterReplySchema } from 'schemas';
import { requestSchema } from 'remote';
import PageCenteredGridContainer from 'components/helpers/PageCenteredGridContainer';
import { UserpassWithRegistrationCode } from './UserPassWithRegistrationCodeForm';
import { RegistrationForm } from 'schemas/auth';

type RegisterFormProps = {
  onLoginClick: () => void,
}

export class RegisterFormPage extends React.Component<RegisterFormProps> {
  state = {
    messageDisp: "",
    messageDispColor: "red",
  }


  public onSubmit = async (form: RegistrationForm) => {
    var registerreply = await requestSchema<RegistrationForm, RegisterReply>("/register-account", form, "POST", RegisterReplySchema, false);

    if (registerreply === null) {
      this.setState({ messageDisp: "Connection Error!", username: "", password: "", messageDispColor: "red" });
    } else {
      if (registerreply.success) {
        this.setState({ messageDisp: "Successfully created account!", username: "", password: "", messageDispColor: "green" });
      } else {
        this.setState({ messageDisp: registerreply.message, username: "", password: "", messageDispColor: "red" });
      }
    }
  }

  render() {
    return (
      <PageCenteredGridContainer childWidth='30vw' childHeight='60vh'>
        <Card style={{ width: "100%", height: "100%" }}>
          <Card.Title style={{ padding: "20px 0px 0px 20px" }}>Register to MonopolyClone!</Card.Title>
          <Card.Body>

            <UserpassWithRegistrationCode
              onSubmit={this.onSubmit} messageDisp={this.state.messageDisp}
              messageDispColor={this.state.messageDispColor}
              title="Register to MonopolyClone!"
              passwordAutoComplete='new-password' />

          </Card.Body>

          <Card.Footer>Already have an account? <Card.Link onClick={this.props.onLoginClick} style={{ cursor: "pointer" }}>Login</Card.Link></Card.Footer>
        </Card>
      </PageCenteredGridContainer>
    );
  }

}