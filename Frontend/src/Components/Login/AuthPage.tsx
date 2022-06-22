import React from 'react';
import { LoginFormPage } from './LoginForm';
import { RegisterFormPage } from './RegisterForm';

export class AuthPage extends React.Component {

  state = {
    onregisterpage: false,
  }

  goToRegister = () => {
    console.log("go to register pls")
  }

  render() {

    let formpage;
    if (this.state.onregisterpage) {
      formpage = <RegisterFormPage />

    } else {
      formpage = <LoginFormPage goToRegister={this.goToRegister} />
    }

    return (
      formpage
    )
  }
}