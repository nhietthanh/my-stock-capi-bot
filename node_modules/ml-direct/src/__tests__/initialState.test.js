import direct from '../index';
// Test functions from https://www.sfu.ca/~ssurjano/optimization.html

describe('Initial state option', () => {
  it('The result after two runs of 50 iterations should be equal to one of 100 iterations', () => {
    const lowerBoundaries = [-5, -2];
    const upperBoundaries = [4, 3];

    const firstRun = direct(griewank, lowerBoundaries, upperBoundaries, {
      iterations: 50,
    });

    const secondRun = direct(griewank, lowerBoundaries, upperBoundaries, {
      iterations: 50,
      initialState: firstRun.finalState, // Adding the final state from firstRun as initial state in secondRun
    });

    const thirdRun = direct(griewank, lowerBoundaries, upperBoundaries, {
      iterations: 100,
    });

    expect(secondRun.optimum).toStrictEqual(thirdRun.optimum);
    expect(secondRun.iterations).toBe(50);
    expect(secondRun.finalState.totalIterations).toBe(100);
    expect(secondRun.minFunctionValue).toStrictEqual(thirdRun.minFunctionValue);
  });
});

function griewank(x) {
  const d = x.length;
  let s = 0;
  let p = 1;
  for (let i = 0; i < d; i++) {
    s += x[i] ** 2 / Math.sqrt(4000);
    p *= Math.cos(x[i] / Math.sqrt(i + 1));
  }
  let result = s - p + 1;
  return result;
}
