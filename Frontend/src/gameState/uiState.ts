import { GameEffect } from "./effectsSchemas";
import { PropertyDeed } from "./gameState";

export const initialUI: UIState = {
  displayDices: [3, 3],
  turnPhase: 0,
  hasPurchasedUpgrade: false,
  connectedUpkeep: [],
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

export type TradeOffer = {
  properties: PropertyDeed[],
  money: number,
}

export type TradeState = {
  tradeInitiator: string,
  tradeTarget: string,

  initiatorConsent: boolean,
  targetConsent: boolean,

  initiatorOffer: TradeOffer,
  targetOffer: TradeOffer,
}


export type UIState = {
  displayDices: [number, number];
  turnPhase: TurnPhase
  propertyToBuy?: UIPropertyToBuy | null,
  effectToAcknowledge?: EffectToAcknowledge | null,
  currentAuction?: Auction | null,
  currentTrade?: TradeState | null,

  connectedUpkeep: boolean[], // whether player is connected or not
  hasPurchasedUpgrade: boolean,
};