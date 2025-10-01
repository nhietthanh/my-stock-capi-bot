import antiLowerConvexHull from '../antiLowerConvexHull';

describe('testing lower convexhull function', () => {
  it('Get anti clockwise lower convex hull', () => {
    const x = [1, 1, 2, 2, 3, 4, 4];
    const y = [2, 4, 0, 7, 6, 3, 4];
    const lowerConvexHull = antiLowerConvexHull(x, y);
    expect(lowerConvexHull).toStrictEqual([0, 2, 5, 6]);
  });

  it('Get anti clockwise lower convex hull square', () => {
    const x = [1, 1, 1, 2, 2, 2, 3, 3, 3];
    const y = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    const lowerConvexHull = antiLowerConvexHull(x, y);
    expect(lowerConvexHull).toStrictEqual([0, 3, 6, 7, 8]);
  });

  it('Get anti clockwise lower convex hull 4', () => {
    const x = [1, 3, 3, 4, 5, 5, 6, 6, 8, 8, 10];
    const y = [1, 2, 3, 1, 3, 5, 1, 3, 3, 5, 5];
    const lowerConvexHull = antiLowerConvexHull(x, y);
    expect(lowerConvexHull).toStrictEqual([0, 3, 6, 8, 10]);
  });
});
