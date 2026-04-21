export const calculateDistance = (a, b) => {
  const R = 6371;

  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const aVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));

  return R * c;
};

export const optimizeRoute = (locations) => {
  if (locations.length <= 2) return locations;

  const visited = [];
  const unvisited = [...locations];

  let current = unvisited.shift();
  visited.push(current);

  while (unvisited.length > 0) {
    let nearest = unvisited[0];
    let minDist = calculateDistance(current, nearest);

    for (let loc of unvisited) {
      const dist = calculateDistance(current, loc);
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    }

    visited.push(nearest);
    unvisited.splice(unvisited.indexOf(nearest), 1);
    current = nearest;
  }

  return visited;
};

export const totalRouteDistance = (locations) => {
  let total = 0;

  for (let i = 0; i < locations.length - 1; i++) {
    total += calculateDistance(locations[i], locations[i + 1]);
  }

  return total.toFixed(2);
};

export const calculateCost = (distance, mode) => {
  const fuelRates = {
    car: 15,
    truck: 5,
    bus: 7,
    flight: 0.1,
  };

  const fuelPrice = {
    car: 100,
    truck: 90,
    bus: 95,
    flight: 500,
  };

  const fuelUsed = distance / fuelRates[mode];
  const totalCost = fuelUsed * fuelPrice[mode];

  return totalCost.toFixed(2);
};