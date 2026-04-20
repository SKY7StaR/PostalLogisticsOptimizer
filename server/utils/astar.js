const { haversineDistance } = require("./dijkstra");

const calculateAStarScore = (current, candidate, destination) => {
  const travelCost = haversineDistance(current, candidate);
  const heuristic = haversineDistance(candidate, destination);

  return travelCost + heuristic;
};

const optimizeWithAStar = (deliveries) => {
  if (deliveries.length <= 2) {
    return deliveries.map((delivery, index) => ({
      ...delivery,
      sequence: index + 1,
    }));
  }

  const remaining = deliveries.slice(1);
  const ordered = [deliveries[0]];
  const destination = deliveries[deliveries.length - 1];
  let current = deliveries[0];

  while (remaining.length > 0) {
    remaining.sort(
      (first, second) =>
        calculateAStarScore(current, first, destination) -
        calculateAStarScore(current, second, destination)
    );

    current = remaining.shift();
    ordered.push(current);
  }

  return ordered.map((delivery, index) => ({
    ...delivery,
    sequence: index + 1,
  }));
};

module.exports = {
  optimizeWithAStar,
};
