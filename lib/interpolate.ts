import { constrain } from "./constrain";

export function interpolate(
  input: number,
  domain: [number, number],
  range: [number, number],
  extrapolation: "extrapolate" | "clamp" = "extrapolate"
) {
  let output =
    (input - domain[0]) * ((range[1] - range[0]) / (domain[1] - domain[0])) +
    range[0];

  if (extrapolation === "clamp") {
    output = constrain(output, range);
  }

  return output;
}
