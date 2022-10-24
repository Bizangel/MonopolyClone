import React from "react";
import { Container } from 'react-bootstrap';


interface PageCenteredGridContainerProps {
  children: React.ReactNode;
  childWidth: string;
  childHeight: string;
}


function ContainerSizeWrapper(x: React.ReactNode, childWidth: string, childHeight: string) {
  return (
    <Container style={{ width: childWidth, height: childHeight, margin: "0 0 0 0", padding: "0 0 0 0" }}>
      {x}
    </Container>
  );

}

export default function PageCenteredGridContainer(props: PageCenteredGridContainerProps) {
  return (
    <Container className="fullPageContainer d-flex align-items-center justify-content-center" style={{ margin: "0 0 0 0", padding: "0 0 0 0" }} fluid>
      {ContainerSizeWrapper(props.children, props.childWidth, props.childHeight)}
    </Container>
  )
}