import React, { useState } from 'react';
import { Form, Button as Button2 } from 'react-bootstrap';
import { RegistrationForm } from 'schemas/auth';


type UserpassWithRegistrationCodeProps = {
  onSubmit: (form: RegistrationForm) => void,
  messageDisp: string,
  messageDispColor: string,
  title: string,
  passwordAutoComplete: string,
}


export function UserpassWithRegistrationCode(props: UserpassWithRegistrationCodeProps) {
  const [formState, setFormState] = useState<RegistrationForm>({ username: "", password: "", registrationTemporaryPasssword: "" })

  return (
    <Form className="loginForm" onSubmit={(e) => { props.onSubmit(formState); e.preventDefault() }}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Username</Form.Label>
        <Form.Control type="username" placeholder="Enter Username"
          name="username"
          value={formState.username}
          onChange={
            (event) => { setFormState(e => { return { ...e, username: event.target.value } }) }
          }
          autoComplete="username" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password"
          name="password"
          value={formState.password}
          onChange={
            (event) => { setFormState(e => { return { ...e, password: event.target.value } }) }
          }
          autoComplete="password"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Received</Form.Label>
        <Form.Control placeholder="Enter Registration Code"
          name="registrationTemporaryPassword"
          value={formState.registrationTemporaryPasssword}
          onChange={
            (event) => { setFormState(e => { return { ...e, registrationTemporaryPasssword: event.target.value } }) }
          }
        />
      </Form.Group>

      <p style={{ color: props.messageDispColor }}>
        {props.messageDisp}
      </p>

      <Button2 variant="primary" onClick={() => props.onSubmit(formState)}>
        Submit
      </Button2>



    </Form>
  )

}