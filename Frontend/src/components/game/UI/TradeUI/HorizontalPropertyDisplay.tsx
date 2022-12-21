import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { propertyIDToImgpath } from "common/cardImages"
import { WheelEventHandler } from "react"
import { Card, Overlay, Popover, Row } from "react-bootstrap"
import { HouseImgTag, MoneyImgTag } from "common/common";
import { PropertyDeed } from "gameState/gameState";
import { propertyToColor } from "common/propertyConstants";


type CardWithHoverRef = {
  removeHover: () => void,
}

const CardWithHover = forwardRef(
  (props: {
    placement?: "bottom" | "top",
    property: PropertyDeed
    containerRef?: React.RefObject<HTMLElement>,
    onClick?: (property: PropertyDeed) => void,
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
          props.onClick(props.property);
      } else if (e.type === 'contextmenu') {
        setShown(e => !e);
        e.preventDefault()
      }
    }

    var isMortgaged = props.property.upgradeState === -1;
    var mortgageFilter = isMortgaged ? "brightness(50%)" : ""

    var color = propertyToColor(props.property.propertyID);
    var toDisplayUpgrade = color !== "black" && color !== "gray";

    return (
      <>
        <Overlay target={internalOverlay} show={isShown} placement={props.placement ? props.placement : "bottom"}>
          <Popover>
            <p className="m-0 p-1 text-center text-info">
              Base Price: {props.basePrice} <MoneyImgTag />
            </p>

            {
              toDisplayUpgrade && !isMortgaged &&
              <p className="text-justify text-center text-primary">
                {`Upgrade: ${props.property.upgradeState} `} <HouseImgTag />
              </p>
            }

            {isMortgaged && <i>This property is mortgaged</i>}
            <img style={{ filter: mortgageFilter }}
              className="rounded float-left img-fluid mw-100 mh-100" src={propertyIDToImgpath.get(props.property.propertyID)} alt="" />

          </Popover>
        </Overlay>

        <img ref={internalOverlay} style={{ maxHeight: "100%", width: "auto", height: "auto", filter: mortgageFilter }}
          onClick={onClick} onContextMenu={onClick}
          src={propertyIDToImgpath.get(props.property.propertyID)} alt=""></img>
      </>
    );
  });

export function HorizontalPropertyWindow(props: {
  hoverPlacement?: "bottom" | "top"
  reverse?: boolean,
  properties: PropertyDeed[], // id of properties to display
  onPropertyClick?: (property: PropertyDeed) => void,
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
              <CardWithHover placement={props.hoverPlacement} property={e} key={e.propertyID} ref={(node) => { getCardRef(node, e.propertyID) }}
                basePrice={200} onClick={props.onPropertyClick}
              />
            )
          }
        </Row>
      </Card>
    </div >
  )
}