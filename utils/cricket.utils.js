function ballsToOvers(balls) {
  const overs = Math.floor(balls / 6);
  const remaining = balls % 6;
  return `${overs}.${remaining}`;
}

function calculateRunRate(runs, balls) {
  if (balls === 0) return 0;
  return (runs / (balls / 6)).toFixed(2);
}

module.exports = { ballsToOvers, calculateRunRate };