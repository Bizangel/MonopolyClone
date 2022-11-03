

export const NProperties = 28;

export type PropertyColor = (
  "brown" | "lightblue" | "pink" | "orange" |
  "red" | "yellow" | "green" | "blue" |
  "black" | "gray"
)

// number between 0 and 27
export function propertyToColor(propertyID: number): PropertyColor {
  if ((propertyID < 0) || (propertyID > NProperties - 1))
    throw new Error("Given Invalid property ID to get color of!")

  if ((0 <= propertyID) && (propertyID <= 1))
    return "brown"
  else if (propertyID <= 4)
    return "lightblue"
  else if (propertyID <= 7)
    return "pink";
  else if (propertyID <= 10)
    return "orange"
  else if (propertyID <= 13)
    return "red"
  else if (propertyID <= 16)
    return "yellow"
  else if (propertyID <= 19)
    return "green"
  else if (propertyID <= 21)
    return "blue"
  else if (propertyID <= 25)
    return "black"
  else
    return "gray";
}

export const colorsToHex = new Map<PropertyColor, string>([
  ["brown", "#997462"],
  ["lightblue", "#adddf5"],
  ["pink", "#c33c82"],
  ["orange", "#f08e30"],
  ["red", "#dd2328"],
  ["yellow", "#fff100"],
  ["green", "#18a966"],
  ["blue", "#0066a4"],
  ["black", "#4b413f"],
  ["gray", "#a8a6af"]
]);