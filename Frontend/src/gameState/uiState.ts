import { GameEffect } from "./effectsSchemas";

export const initialUI: UIState = {
  displayDices: [3, 3],
  turnPhase: 0
}

export enum TurnPhase {
  Standby,
  Choiceby,
  Auctionby
};

type UIPropertyToBuy = {
  propertyID: number,
  price: number,
}

export type EffectToAcknowledge = {
  description: string,
  effect: GameEffect
};

type Bid = {
  bidder: string,
  bidAmount: number,
}

export type Auction = {
  bids: Bid[],
  topBid: number,
  currentAuctionDeadline: number,
  auctionedProperty: number,
}

export type UIState = {
  displayDices: [number, number];
  turnPhase: TurnPhase
  propertyToBuy?: UIPropertyToBuy | null,
  effectToAcknowledge?: EffectToAcknowledge | null,
  currentAuction?: Auction | null,
};