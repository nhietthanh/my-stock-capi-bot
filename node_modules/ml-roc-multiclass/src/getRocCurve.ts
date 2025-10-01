import { getBinaryClassifiers } from './getBinaryClassifiers';
import { Curve } from './types/Curve';
import { getClasses } from './utilities/getClasses';
import { getClassesPairs } from './utilities/getClassesPairs';
import { getSelectedResults } from './utilities/getSelectedResults';

/**
 * Returns a ROC (Receiver Operating Characteristic) curve for a given response and prediction vectors.
 * @param responses Array containing category metadata.
 * @param predictions Array containing the results of regression.
 * @return sensitivities and specificities as a object.
 */

export function getRocCurve(responses: string[], predictions: number[]) {
  const classes = getClasses(responses);
  const pairsOfClasses = getClassesPairs(classes);
  const curves: Curve[] = [];
  for (const pairs of pairsOfClasses) {
    const tests = getSelectedResults(predictions, pairs);
    const targets = getSelectedResults(responses, pairs);
    const { truePositives, falsePositives, trueNegatives, falseNegatives } =
      getBinaryClassifiers(targets, tests);

    const curve: Curve = { sensitivities: [], specificities: [] };
    for (let i = 0; i < truePositives.length; i++) {
      curve.sensitivities.push(
        truePositives[i] / (truePositives[i] + falseNegatives[i]),
      );

      curve.specificities.push(
        trueNegatives[i] / (falsePositives[i] + trueNegatives[i]),
      );
    }
    curves.push(curve);
  }
  return curves;
}
