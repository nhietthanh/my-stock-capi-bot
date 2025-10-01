import mean from 'ml-array-mean';

import { Curve } from './types/Curve';

/**
 * Returns the Area under the curve.
 * @param curves Object containing the true positivie and false positive rate vectors.
 * @return Area under the curve.
 */

export function getAuc(curves: Curve[]) {
  const auc: number[] = [];
  for (const curve of curves) {
    let area = 0;
    const x = curve.specificities;
    const y = curve.sensitivities;
    for (let i = 1; i < x.length; i++) {
      area += 0.5 * (x[i] - x[i - 1]) * (y[i] + y[i - 1]);
    }
    area = area > 0.5 ? area : 1 - area;
    auc.push(area);
  }
  return mean(auc);
}
