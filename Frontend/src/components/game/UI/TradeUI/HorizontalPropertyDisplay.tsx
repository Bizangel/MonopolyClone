import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { propertyIDToImgpath } from "common/cardImages"
import { WheelEventHandler } from "react"
import { Card, Overlay, Popover, Row } from "react-bootstrap"
import { MoneyImgTag } from "common/common";


type CardWithHoverRef = {
  removeHover: () => void,
}

const CardWithHover = forwardRef(
  (props: {
    placement?: "bottom" | "top",
    propertyID: number
    containerRef?: React.RefObject<HTMLElement>,
    onClick?: (propertyID: number) => void,
    basePrice: number,
  }, ref: React.Ref<CardWithHoverRef>) => {
    const [isShown, setShown] = useState(false);
    const internalOverlay = useRef(null);

    useImperativeHandle(ref, () => ({
      removeHover: () => {
        setShown(false);
      },
    }));

    const onClick = (e: any) => {
      if (e.type === 'click') {
        setShown(false);
        if (props.onClick)
          props.onClick(props.propertyID);
      } else if (e.type === 'contextmenu') {
        setShown(e => !e);
        e.preventDefault()
      }
    }

    return (
      <>
        <Overlay target={internalOverlay} show={isShown} placement={props.placement ? props.placement : "bottom"}>
          <Popover>
            <p className="m-0 p-1 text-center text-info">
              Base Price: {props.basePrice} <MoneyImgTag />
            </p>

            <img className="rounded float-left img-fluid mw-100 mh-100" src={propertyIDToImgpath.get(props.propertyID)} alt="" />

          </Popover>
        </Overlay>

        <img ref={internalOverlay} style={{ maxHeight: "100%", width: "auto", height: "auto" }}
          onClick={onClick} onContextMenu={onClick}
          src={propertyIDToImgpath.get(props.propertyID)} alt=""></img>
      </>
    );
  });

export function HorizontalPropertyWindow(props: {
  hoverPlacement?: "bottom" | "top"
  reverse?: boolean,
  properties: number[], // id of properties to display
  onPropertyClick?: (propertyID: number) => void,
}) {

  const internalScrollRef = useRef<HTMLElement>(null);

  const cardRefs = useRef<Map<number, CardWithHoverRef> | null>(null);

  const getCardRefsmaps = () => {
    if (!cardRefs.current) {
      cardRefs.current = new Map<number, CardWithHoverRef>();
    }
    return cardRefs.current;
  };

  const getCardRef = (node: CardWithHoverRef | null, propertyID: number) => {
    const map = getCardRefsmaps();
    if (node) {
      map.set(propertyID, node);
    } else {
      map.delete(propertyID);
    }
  }

  const onScroll: WheelEventHandler<HTMLDivElement> = (e: React.WheelEvent<HTMLDivElement>) => {
    if (internalScrollRef.current) {
      internalScrollRef.current.scrollLeft += e.deltaY;
      getCardRefsmaps().forEach(e => e.removeHover());
    }
  };


  var reversedClass = props.reverse ? "flex-row-reverse" : "flex-row";

  return (
    <div className="h-100 w-100" onWheel={onScroll}>
      <Card className="h-100 w-100">
        <Row className={`d-flex ${reversedClass} flex-nowrap h-100`} style={{ overflowX: "auto" }} ref={internalScrollRef}>
          {
            props.properties.map((e) =>
              <CardWithHover placement={props.hoverPlacement} propertyID={e} key={e} ref={(node) => { getCardRef(node, e) }}
                basePrice={200} onClick={props.onPropertyClick}
              />
            )
          }
        </Row>
      </Card>
    </div >
  )
}