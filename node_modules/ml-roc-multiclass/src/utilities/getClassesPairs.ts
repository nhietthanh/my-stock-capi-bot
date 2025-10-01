import { Class } from '../types/Class';

/**
 * Returns an array of pairs of classes.
 * @param list Array containing a list of classes.
 * @return Array with pairs of classes.
 */

export function getClassesPairs(list: Class[]) {
  const pairs: [Class, Class][] = [];
  for (let i = 0; i < list.length - 1; i++) {
    for (let j = i + 1; j < list.length; j++) {
      pairs.push([list[i], list[j]]);
    }
  }
  return pairs;
}
