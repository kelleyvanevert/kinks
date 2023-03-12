export function constrain(value: number, range: [number, number]) {
  return Math.min(Math.max(value, range[0]), range[1]);
}
