import { Class } from '../types/Class';

/**
 * Returns the array of metadata numerically categorized.
 * @param array Array containing the categories.
 * @param pair Object containing information about the two classes to deal with.
 * @return Array containing the prediction values arranged for the corresponding classes.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSelectedResults(array: any[], pair: [Class, Class]) {
  const results = [];
  for (const item of pair) {
    for (const id of item.ids) {
      const result = array[id];
      results.push(result);
    }
  }
  return results;
}
