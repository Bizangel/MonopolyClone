import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { PageCenteredGridContainer } from '../Helpers/PageCenteredGridContainer';
import { RequestManager } from '../Requests/Requests';
class LoginForm extends React.Component {

  state = {
    username: "",
    password: "",
  };

  // This syntax allows for (this) to be defined.
  onSubmit = async () => {
    console.log(this.state);
    await RequestManager.performPOST("/", this.state);

    //check stackoverflow reference, basically reset manually.
  }

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
        {/* <Button variant="primary" type="submit">
          Submit
        </Button> */}

        <Button variant="primary" onClick={this.onSubmit}>
          Submit
        </Button>


      </Form>
    )
  }
}

export class LoginFormPage extends React.Component {
  render() {
    return (
      <PageCenteredGridContainer childWidth='20vw' childHeight='40vh'>
        <LoginForm />
      </PageCenteredGridContainer>
    );

  }

}