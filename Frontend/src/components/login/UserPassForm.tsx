import React, { useState } from 'react';
import { Form, Button as Button2 } from 'react-bootstrap';
import { AuthForm } from 'schemas'


type UserPassFormProps = {
  onSubmit: (form: AuthForm) => void,
  messageDisp: string,
  messageDispColor: string,
  title: string,
  passwordAutoComplete: string,
}


export function UserPassForm(props: UserPassFormProps) {
  const [formState, setFormState] = useState<AuthForm>({ username: "", password: "" })

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
          value={formState.username}
          onChange={
            (event) => { setFormState(e => { return { ...e, password: event.target.value } }) }
          }
          autoComplete="password"
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