import React, { useState } from 'react';
import { Form, Button as Button2 } from 'react-bootstrap';

const emptyForm = { username: "", password: "", confirmPassword: "", registrationCode: "" };

export type RegistrationFormClientSide = typeof emptyForm;

type UserpassWithRegistrationCodeProps = {
  onSubmit: (form: RegistrationFormClientSide) => Promise<boolean>,
  messageDisp: string,
  messageDispColor: string,
  title: string
}


export function UserpassWithRegistrationCode(props: UserpassWithRegistrationCodeProps) {
  const [formState, setFormState] = useState<RegistrationFormClientSide>(emptyForm)

  const onSubmit = async () => {
    if (await props.onSubmit(formState)) {
      setFormState(emptyForm)
    }
  }

  return (
    <Form onSubmit={(e) => { onSubmit(); e.preventDefault() }}>
      <Form.Group className="mb-3" controlId="formBasicUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control type="username" placeholder="Desired Username"
          name="new-username"
          value={formState.username}
          onChange={
            (event) => { setFormState(e => { return { ...e, username: event.target.value } }) }
          }
          autoComplete="new-username" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password"
          name="new-password"
          value={formState.password}
          onChange={
            (event) => { setFormState(e => { return { ...e, password: event.target.value } }) }
          }
          autoComplete="new-password"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPasswordConfirm">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control type="password" placeholder="Confirm Password"
          name="new-password"
          value={formState.confirmPassword}
          onChange={
            (event) => { setFormState(e => { return { ...e, confirmPassword: event.target.value } }) }
          }
          autoComplete="new-password-confirm"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formRegistrationCode">
        <Form.Label>Secret Registration Code</Form.Label>

        <Form.Control placeholder="Enter Registration Code"
          name="registrationTemporaryPassword"
          value={formState.registrationCode}
          onChange={
            (event) => { setFormState(e => { return { ...e, registrationCode: event.target.value } }) }
          }
        />
        <Form.Text className="text-muted">
          Ask Zangel if unknown.
        </Form.Text>
      </Form.Group>

      <p style={{ color: props.messageDispColor }}>
        {props.messageDisp}
      </p>

      <Button2 variant="primary" type="submit">
        Submit
      </Button2>
    </Form>
  )

}