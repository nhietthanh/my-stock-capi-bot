import { getThresholds } from './utilities/getThresholds';

/**
 * Returns a ROC (Receiver Operating Characteristic) curve for a given response and prediction vectors.
 * @param responses Array containing category metadata.
 * @param predictions Array containing the results of regression.
 * @return sensitivities and specificities as a object.
 */

export function getBinaryClassifiers(
  responses: string[],
  predictions: number[],
) {
  const limits = getThresholds(predictions);
  const truePositives: number[] = [];
  const falsePositives: number[] = [];
  const trueNegatives: number[] = [];
  const falseNegatives: number[] = [];
  for (const limit of limits) {
    let truePositive = 0;
    let falsePositive = 0;
    let trueNegative = 0;
    let falseNegative = 0;
    const category = responses[0];
    for (let j = 0; j < responses.length; j++) {
      if (responses[j] !== category && predictions[j] > limit) truePositive++;
      if (responses[j] === category && predictions[j] > limit) falsePositive++;
      if (responses[j] === category && predictions[j] < limit) trueNegative++;
      if (responses[j] !== category && predictions[j] < limit) falseNegative++;
    }
    truePositives.push(truePositive);
    falsePositives.push(falsePositive);
    trueNegatives.push(trueNegative);
    falseNegatives.push(falseNegative);
  }
  return {
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
  };
}
