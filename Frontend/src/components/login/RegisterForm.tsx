import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { RegisterReply, RegisterReplySchema } from 'schemas';
import { requestSchema } from 'remote';
import PageCenteredGridContainer from 'components/helpers/PageCenteredGridContainer';
import { RegistrationFormClientSide, UserpassWithRegistrationCode } from './UserPassWithRegistrationCodeForm';
import { RegistrationForm } from 'schemas/auth';

type RegisterFormProps = {
  onLoginClick: () => void,
}

export function RegisterFormPage(props: RegisterFormProps) {


  const [subDisplay, setSubDisplay] = useState({ messageDispColor: "red", messageDisp: "" });

  const onSubmit = async (form: RegistrationFormClientSide): Promise<boolean> => {
    if (form.password !== form.confirmPassword) {
      setSubDisplay({ messageDisp: "Passwords must match!", messageDispColor: "red" });
      return false; // don't clear
    }

    var toSend = { username: form.username, password: form.password, registrationTemporaryPasssword: form.registrationCode };
    var registerreply = await requestSchema<RegistrationForm, RegisterReply>("/register-account", toSend, "POST", RegisterReplySchema, false);

    if (registerreply === null) {
      setSubDisplay({ messageDisp: "Connection Error!", messageDispColor: "red" });
      return false; // don't clear
    } else {
      if (registerreply.success) {
        setSubDisplay({ messageDisp: "Successfully created account!", messageDispColor: "green" });
        return true;
      } else {
        setSubDisplay({ messageDisp: registerreply.message, messageDispColor: "red" });
        return false;// if something invalid, here, like existing, etc, don't clear
      }
    }
  }

  return (
    <PageCenteredGridContainer childWidth='30vw' childHeight='75vh'>
      <Card style={{ width: "100%", height: "100%" }}>
        <Card.Title style={{ padding: "20px 0px 0px 20px" }}>Register to MonopolyClone!</Card.Title>
        <Card.Body>

          <UserpassWithRegistrationCode
            onSubmit={onSubmit} messageDisp={subDisplay.messageDisp}
            messageDispColor={subDisplay.messageDispColor}
            title="Register to MonopolyClone!"
          />

        </Card.Body>

        <Card.Footer>Already have an account? <Card.Link onClick={props.onLoginClick} style={{ cursor: "pointer" }}>Login</Card.Link></Card.Footer>
      </Card>
    </PageCenteredGridContainer>
  );
}