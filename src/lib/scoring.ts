export function calcScore(
  swimming_meters: number,
  biking_km: number,
  running_km: number
): number {
  return Math.round(swimming_meters * 10 + biking_km * 1000 + running_km * 3000)
}

export function milesToKm(miles: number): number {
  return miles * 1.60934
}

export function kmToMiles(km: number): number {
  return km / 1.60934
}

export function formatScore(score: number): string {
  return score.toLocaleString()
}
