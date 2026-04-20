const { haversineDistance } = require("./dijkstra");

const majorHubs = [
  { name: "Bengaluru Transit Hub", lat: 12.9716, lng: 77.5946 },
  { name: "Mumbai Freight Hub", lat: 19.076, lng: 72.8777 },
  { name: "Nagpur Sorting Hub", lat: 21.1458, lng: 79.0882 },
  { name: "Hyderabad Relay Hub", lat: 17.385, lng: 78.4867 },
  { name: "Delhi National Hub", lat: 28.6139, lng: 77.209 },
];

const speedMap = {
  bike: 35,
  van: 45,
  truck: 38,
  express: 65,
};

const costRatePerKm = {
  bike: 8,
  van: 18,
  truck: 26,
  express: 32,
};

const sanitizePoints = (points) =>
  points.filter(
    (point, index) =>
      point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      (index === 0 ||
        point.name !== points[index - 1]?.name ||
        point.lat !== points[index - 1]?.lat ||
        point.lng !== points[index - 1]?.lng)
  );

const getNearestHub = (point, excludedNames = []) => {
  const eligible = majorHubs.filter((hub) => !excludedNames.includes(hub.name));
  return eligible.sort(
    (first, second) =>
      haversineDistance(point, first) - haversineDistance(point, second)
  )[0];
};

const buildOption = (id, name, points, vehicleType, multiplier, reference) => {
  const checkpoints = sanitizePoints(points);
  let totalDistanceKm = 0;

  for (let index = 0; index < checkpoints.length - 1; index += 1) {
    totalDistanceKm += haversineDistance(checkpoints[index], checkpoints[index + 1]);
  }

  const adjustedDistance = totalDistanceKm * multiplier;
  const durationHours =
    adjustedDistance / (speedMap[vehicleType] || speedMap.van);
  const estimatedCost =
    adjustedDistance * (costRatePerKm[vehicleType] || costRatePerKm.van);

  return {
    id,
    name,
    checkpoints,
    totalDistanceKm: Number(adjustedDistance.toFixed(2)),
    estimatedHours: Number(durationHours.toFixed(2)),
    estimatedCost: Number(estimatedCost.toFixed(2)),
    reference,
  };
};

const buildRouteAlternatives = (deliveries, metrics = {}) => {
  if (!deliveries?.length) {
    return [];
  }

  const start = {
    name: deliveries[0].origin || "Dispatch Hub",
    lat: Number.isFinite(deliveries[0].originLat)
      ? deliveries[0].originLat
      : deliveries[0].lat,
    lng: Number.isFinite(deliveries[0].originLng)
      ? deliveries[0].originLng
      : deliveries[0].lng,
  };

  const stops = deliveries.map((delivery) => ({
    name: delivery.destination || delivery.name,
    lat: delivery.lat,
    lng: delivery.lng,
  }));
  const end = stops[stops.length - 1];
  const midHub = getNearestHub({
    name: "Mid Corridor",
    lat: (start.lat + end.lat) / 2,
    lng: (start.lng + end.lng) / 2,
  });
  const sourceHub = getNearestHub(start);
  const destinationHub = getNearestHub(end, [sourceHub?.name].filter(Boolean));
  const vehicleType = metrics.vehicleType || "van";

  const options = [
    buildOption(
      "direct-express",
      "Direct Express Corridor",
      [start, ...stops],
      vehicleType,
      1,
      "Reference: based on the current optimized stop order and direct corridor distance."
    ),
  ];

  if (midHub) {
    options.push(
      buildOption(
        "central-relay",
        "Central Relay Route",
        [start, midHub, ...stops],
        vehicleType,
        1.06,
        "Reference: adds a midpoint postal relay hub to simulate a structured transfer route."
      )
    );
  }

  if (sourceHub && destinationHub) {
    options.push(
      buildOption(
        "freight-corridor",
        "Freight Hub Corridor",
        [start, sourceHub, ...stops.slice(0, -1), destinationHub, end],
        vehicleType,
        1.12,
        "Reference: models a freight-oriented relay using major regional sorting hubs."
      )
    );
  }

  if (stops.length > 1) {
    options.push(
      buildOption(
        "priority-sweep",
        "Priority Sweep Route",
        [start, ...stops.slice().reverse()],
        vehicleType,
        1.09,
        "Reference: simulates an alternate reverse sweep for comparing cost and corridor spread."
      )
    );
  }

  const uniqueOptions = [];
  const seen = new Set();

  options.forEach((option) => {
    const signature = option.checkpoints.map((point) => point.name).join("->");
    if (!seen.has(signature)) {
      seen.add(signature);
      uniqueOptions.push(option);
    }
  });

  return uniqueOptions.slice(0, 4);
};

module.exports = {
  buildRouteAlternatives,
};
