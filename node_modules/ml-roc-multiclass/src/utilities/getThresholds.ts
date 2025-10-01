/**
 * Returns an array of thresholds to build the curve.
 * @param predictions Array of predictions.
 * @return An array of thresholds.
 */

export function getThresholds(predictions: number[]) {
  const uniques: number[] = [...new Set(predictions)].sort((a, b) => a - b);
  const thresholds: number[] = [Number.NEGATIVE_INFINITY];
  for (let i = 0; i < uniques.length - 1; i++) {
    const half = (uniques[i + 1] - uniques[i]) / 2;
    thresholds.push(uniques[i] + half);
  }
  thresholds.push(Number.POSITIVE_INFINITY);
  return thresholds;
}
