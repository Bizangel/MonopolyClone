import { Vec3 } from "cannon-es"
import { Triplet } from "@react-three/cannon"

export function cosineSimilarity(vec1: Vec3, vec2: Vec3) {
  return vec1.dot(vec2) / (vec1.length() * vec2.length());
}

export function tripletLength(triplet: Triplet, squared = false) {
  var sq = triplet[0] * triplet[0] + triplet[1] * triplet[1] + triplet[2] * triplet[2]
  if (squared)
    return sq
  return Math.sqrt(sq);
}