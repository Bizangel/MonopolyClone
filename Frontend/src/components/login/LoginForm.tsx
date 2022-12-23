import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { LoginReply, LoginReplySchema, AuthForm } from 'schemas';
import { requestSchema } from 'remote';
import PageCenteredGridContainer from 'components/helpers/PageCenteredGridContainer';
import { UserLoginFormCard } from './UserPassForm';


type LoginFormProps = {
  onLoginSuccess: () => void,
  onRegisterClick: () => void,
}

export function LoginFormPage(props: LoginFormProps) {

  const [subDisplay, setSubDisplay] = useState({ messageDispColor: "red", messageDisp: "" });

  const onSubmit = async (form: AuthForm): Promise<boolean> => {
    var loginreply = await requestSchema<AuthForm, LoginReply>("/login", form, "POST", LoginReplySchema, true);

    if (loginreply == null) {
      setSubDisplay({ messageDisp: "Connection Error!", messageDispColor: "red" });
      return false;
    } else {
      if (loginreply.success) {
        setSubDisplay({ messageDisp: "Successful login!", messageDispColor: "green" });
        return true; // clear
      } else {
        setSubDisplay({ messageDisp: "Invalid username or password", messageDispColor: "red" });
        return true;  // clear
      }
    }
  }


  return (
    <PageCenteredGridContainer childWidth='30vw' childHeight='40vh'>
      <Card style={{ width: "100%", height: "100%" }}>
        <Card.Title style={{ padding: "20px 0px 0px 20px" }}>Login to MonopolyClone!</Card.Title>
        <Card.Body>

          <UserLoginFormCard
            onSubmit={onSubmit} messageDisp={subDisplay.messageDisp}
            messageDispColor={subDisplay.messageDispColor}
            title="Register to MonopolyClone!" />

        </Card.Body>

        <Card.Footer>Don't have an account? <Card.Link onClick={props.onRegisterClick} style={{ cursor: "pointer" }}>Register!</Card.Link></Card.Footer>
      </Card>
    </PageCenteredGridContainer>
  );



}