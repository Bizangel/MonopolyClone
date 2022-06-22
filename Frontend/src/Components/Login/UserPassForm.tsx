import React from 'react';
import { Form, Button } from 'react-bootstrap';

type UserPassFormProps = {
  onSubmit: (form: UserPassForm) => void,
  messageDisp: string,
  messageDispColor: string,
  title: string,
}

export class UserPassForm extends React.Component<UserPassFormProps>{

  state = {
    username: "",
    password: "",
  };

  // This syntax allows for (this) to be defined.
  // onSubmit = 

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value })
  };

  render() {
    return (
      <Form className="loginForm">
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control type="username" placeholder="Enter Username"
            name="username"
            value={this.state.username}
            onChange={this.onChange} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password"
            name="password"
            value={this.state.password}
            onChange={this.onChange}
          />
        </Form.Group>
        <p style={{ color: this.props.messageDispColor }}>
          {this.props.messageDisp}
        </p>

        <Button variant="primary" onClick={() => this.props.onSubmit(this)}>
          Submit
        </Button>


      </Form>
    )
  }
}