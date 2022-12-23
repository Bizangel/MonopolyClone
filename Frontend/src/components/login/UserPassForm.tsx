import React, { useState } from 'react';
import { Form, Button as Button2 } from 'react-bootstrap';
import { AuthForm } from 'schemas'


type UserLoginFormCardProps = {
  onSubmit: (form: AuthForm) => Promise<boolean>,
  messageDisp: string,
  messageDispColor: string,
  title: string
}


export function UserLoginFormCard(props: UserLoginFormCardProps) {
  const [formState, setFormState] = useState<AuthForm>({ username: "", password: "" })

  const onSubmit = async () => {
    if (await props.onSubmit(formState)) {
      setFormState({ username: "", password: "" })
    }
  }

  return (
    <Form onSubmit={(e) => {
      onSubmit();
      e.preventDefault();
    }}>
      <Form.Group className="mb-3" controlId="formBasicUsername">
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
      <p style={{ color: props.messageDispColor }}>
        {props.messageDisp}
      </p>

      <Button2 variant="primary" type="submit">
        Submit
      </Button2>
    </Form>
  )

}