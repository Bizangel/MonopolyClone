
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

export type UIState = {
  displayDices: [number, number];
  turnPhase: TurnPhase
  propertyToBuy?: UIPropertyToBuy | null,
};