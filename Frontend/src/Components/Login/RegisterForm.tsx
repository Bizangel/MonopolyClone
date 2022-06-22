import React from 'react';
import { Card } from 'react-bootstrap';
import { PageCenteredGridContainer } from '../Helpers/PageCenteredGridContainer';
import { UserPassForm } from './UserPassForm';

export class RegisterFormPage extends React.Component {
  state = {
    messageDisp: "hello",
    messageDispColor: "red",
  }


  public onSubmit = () => {
    console.log("On Submit");
  }

  render() {
    return (
      <PageCenteredGridContainer childWidth='20vw' childHeight='40vh'>
        <Card style={{ width: "100%", height: "100%" }}>
          <Card.Title style={{ padding: "20px 0px 0px 20px" }}>Register to Biza's PanoGuessr!</Card.Title>
          <Card.Body>


            <UserPassForm
              onSubmit={this.onSubmit} messageDisp={this.state.messageDisp}
              messageDispColor={this.state.messageDispColor}
              title="Register to MonopolyClone!" />

          </Card.Body>
        </Card>
      </PageCenteredGridContainer>
    );
  }

}