const toRadians = (value) => (value * Math.PI) / 180;

const haversineDistance = (source, target) => {
  const earthRadiusKm = 6371;
  const latDiff = toRadians(target.lat - source.lat);
  const lngDiff = toRadians(target.lng - source.lng);
  const sourceLat = toRadians(source.lat);
  const targetLat = toRadians(target.lat);

  const arc =
    Math.sin(latDiff / 2) ** 2 +
    Math.sin(lngDiff / 2) ** 2 * Math.cos(sourceLat) * Math.cos(targetLat);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
};

const buildGraph = (deliveries) => {
  const graph = {};

  deliveries.forEach((delivery) => {
    graph[delivery._id.toString()] = {};
  });

  deliveries.forEach((source) => {
    deliveries.forEach((target) => {
      if (source._id.toString() === target._id.toString()) {
        return;
      }

      graph[source._id.toString()][target._id.toString()] = haversineDistance(
        source,
        target
      );
    });
  });

  return graph;
};

const dijkstra = (graph, startId) => {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  Object.keys(graph).forEach((node) => {
    distances[node] = Number.POSITIVE_INFINITY;
    previous[node] = null;
  });

  distances[startId] = 0;

  while (unvisited.size > 0) {
    let currentNode = null;

    unvisited.forEach((node) => {
      if (currentNode === null || distances[node] < distances[currentNode]) {
        currentNode = node;
      }
    });

    if (currentNode === null) {
      break;
    }

    unvisited.delete(currentNode);

    Object.entries(graph[currentNode]).forEach(([neighbor, weight]) => {
      const candidateDistance = distances[currentNode] + weight;

      if (candidateDistance < distances[neighbor]) {
        distances[neighbor] = candidateDistance;
        previous[neighbor] = currentNode;
      }
    });
  }

  return { distances, previous };
};

const rebuildPath = (previous, endId) => {
  const path = [];
  let current = endId;

  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
};

const createMetrics = (orderedDeliveries, vehicleType, vehicleCount) => {
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

  let totalDistanceKm = 0;
  const route = [];

  for (let index = 0; index < orderedDeliveries.length - 1; index += 1) {
    const source = orderedDeliveries[index];
    const target = orderedDeliveries[index + 1];
    const legDistanceKm = haversineDistance(source, target);

    totalDistanceKm += legDistanceKm;
    route.push({
      from: source.name,
      to: target.name,
      distanceKm: Number(legDistanceKm.toFixed(2)),
    });
  }

  const totalVolume = orderedDeliveries.reduce(
    (sum, delivery) => sum + Number(delivery.volume || 1),
    0
  );

  return {
    route,
    metrics: {
      algorithm: "dijkstra-greedy",
      totalStops: orderedDeliveries.length,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      averageDistanceKm:
        orderedDeliveries.length > 1
          ? Number((totalDistanceKm / (orderedDeliveries.length - 1)).toFixed(2))
          : 0,
      estimatedHours: Number(
        (
          totalDistanceKm /
          ((speedMap[vehicleType] || speedMap.van) * Math.max(vehicleCount, 1))
        ).toFixed(2)
      ),
      totalCost: Number(
        (
          totalDistanceKm *
          (costRatePerKm[vehicleType] || costRatePerKm.van) *
          Math.max(vehicleCount, 1)
        ).toFixed(2)
      ),
      totalVolume,
      vehicleType,
      vehicleCount,
    },
  };
};

const splitIntoVehicleClusters = (orderedDeliveries, vehicleCount) => {
  const clusters = Array.from({ length: Math.max(vehicleCount, 1) }, (_, index) => ({
    vehicle: index + 1,
    stops: [],
  }));

  orderedDeliveries.forEach((delivery, index) => {
    clusters[index % clusters.length].stops.push(delivery);
  });

  return clusters.map((cluster) => ({
    vehicle: cluster.vehicle,
    stops: cluster.stops.length,
    names: cluster.stops.map((stop) => stop.name),
  }));
};

const createRoutePlanFromOrderedDeliveries = (
  orderedDeliveries,
  vehicleType,
  vehicleCount,
  algorithm
) => {
  let cumulativeDistanceKm = 0;
  const sequencedDeliveries = orderedDeliveries.map((delivery, index) => {
    const previousDelivery = index > 0 ? orderedDeliveries[index - 1] : null;
    const legDistanceKm = previousDelivery
      ? haversineDistance(previousDelivery, delivery)
      : 0;

    cumulativeDistanceKm += legDistanceKm;

    return {
      ...delivery,
      sequence: index + 1,
      legDistanceKm: Number(legDistanceKm.toFixed(2)),
      cumulativeDistanceKm: Number(cumulativeDistanceKm.toFixed(2)),
    };
  });

  const { route, metrics } = createMetrics(
    sequencedDeliveries,
    vehicleType,
    vehicleCount
  );

  return {
    deliveries: sequencedDeliveries,
    route,
    clusters: splitIntoVehicleClusters(sequencedDeliveries, vehicleCount),
    metrics: {
      ...metrics,
      algorithm,
    },
  };
};

const optimizeDeliveryRoute = (deliveries, options = {}) => {
  const vehicleType = options.vehicleType || "van";
  const vehicleCount = Number(options.vehicleCount || 1);

  if (!deliveries.length) {
    return {
      deliveries: [],
      route: [],
      clusters: [],
      metrics: {
        algorithm: "dijkstra-greedy",
        totalStops: 0,
        totalDistanceKm: 0,
        averageDistanceKm: 0,
        estimatedHours: 0,
        totalCost: 0,
        totalVolume: 0,
        vehicleType,
        vehicleCount,
      },
      summary: "Add delivery points to build an optimized postal route.",
    };
  }

  if (deliveries.length === 1) {
    const onlyDelivery = {
      ...deliveries[0],
      sequence: 1,
      legDistanceKm: 0,
      cumulativeDistanceKm: 0,
    };

    return {
      deliveries: [onlyDelivery],
      route: [],
      clusters: splitIntoVehicleClusters([onlyDelivery], vehicleCount),
      metrics: {
        algorithm: "dijkstra-greedy",
        totalStops: 1,
        totalDistanceKm: 0,
        averageDistanceKm: 0,
        estimatedHours: 0,
        totalCost: 0,
        totalVolume: Number(onlyDelivery.volume || 1),
        vehicleType,
        vehicleCount,
      },
      summary: `Single-stop route prepared for ${onlyDelivery.name}.`,
    };
  }

  const normalizedDeliveries = deliveries.map((delivery, index) => ({
    ...delivery,
    _id: delivery._id || `delivery-${index + 1}`,
  }));

  const graph = buildGraph(normalizedDeliveries);
  const deliveryById = Object.fromEntries(
    normalizedDeliveries.map((delivery) => [delivery._id.toString(), delivery])
  );
  const orderedIds = [];
  const remaining = new Set(normalizedDeliveries.map((delivery) => delivery._id.toString()));
  const startId = normalizedDeliveries
    .slice()
    .sort((first, second) => {
      const priorityRank = { high: 0, medium: 1, low: 2 };
      return (
        (priorityRank[first.priority] ?? 1) - (priorityRank[second.priority] ?? 1)
      );
    })[0]
    ._id.toString();

  let currentId = startId;

  while (remaining.size > 0) {
    orderedIds.push(currentId);
    remaining.delete(currentId);

    if (!remaining.size) {
      break;
    }

    const { distances } = dijkstra(graph, currentId);
    const nextId = [...remaining].sort((first, second) => {
      if (distances[first] !== distances[second]) {
        return distances[first] - distances[second];
      }

      const firstDelivery = deliveryById[first];
      const secondDelivery = deliveryById[second];
      const priorityRank = { high: 0, medium: 1, low: 2 };

      return (
        (priorityRank[firstDelivery.priority] ?? 1) -
        (priorityRank[secondDelivery.priority] ?? 1)
      );
    })[0];

    currentId = nextId;
  }

  const orderedDeliveries = orderedIds.map((id) => deliveryById[id]);
  const sequencedPlan = createRoutePlanFromOrderedDeliveries(
    orderedDeliveries,
    vehicleType,
    vehicleCount,
    "dijkstra-greedy"
  );

  return {
    ...sequencedPlan,
    shortestPaths: Object.fromEntries(
      sequencedPlan.route.map((leg, index) => {
        const currentId = orderedIds[index];
        const nextId = orderedIds[index + 1];
        const { previous } = dijkstra(graph, currentId);

        return [
          `${leg.from}->${leg.to}`,
          rebuildPath(previous, nextId).map((id) => deliveryById[id].name),
        ];
      })
    ),
    summary: `Optimized ${orderedDeliveries.length} deliveries using Dijkstra with ${vehicleCount} ${vehicleType} vehicle${vehicleCount > 1 ? "s" : ""}.`,
  };
};

module.exports = {
  haversineDistance,
  buildGraph,
  dijkstra,
  createRoutePlanFromOrderedDeliveries,
  optimizeDeliveryRoute,
};
