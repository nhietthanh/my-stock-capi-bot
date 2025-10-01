import { Class } from '../types/Class';

/**
 * @param array Array containing category metadata
 * @return Class object.
 */
export function getClasses(array: string[]) {
  let nbClasses = 0;
  const classes: Class[] = [{ name: array[0], value: 0, ids: [] }];
  for (const element of array) {
    const currentClass = classes.some((item) => item.name === element);
    if (!currentClass) {
      nbClasses++;
      classes.push({ name: element, value: nbClasses, ids: [] });
    }
  }

  for (const category of classes) {
    const label = category.name;
    const indexes: number[] = [];
    for (let j = 0; j < array.length; j++) {
      if (array[j] === label) indexes.push(j);
    }
    category.ids = indexes;
  }
  return classes;
}
