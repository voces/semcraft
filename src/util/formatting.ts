/**
 * Formats `value` as a string with `digits` significant digits. Differs from
 * Number#toPrecision in that it does not render in scientific notation.
 * @example
 * precise(0.36, 1); // "0.4"
 * precise(0.36, 2); // "0.36"
 * precise(0.36, 3); // "0.360"
 * precise(360, 1); // "400"
 */
export const precision = (value: number, digits: number) => {
  const precise = value.toPrecision(digits);
  return precise.includes("e") ? parseFloat(precise) : precise;
};
