export const getPointFromAngleAndDistance = (angle, distance) => ({
  x: Math.cos((angle * Math.PI) / 180) * distance,
  y: Math.sin((angle * Math.PI) / 180) * distance
});
