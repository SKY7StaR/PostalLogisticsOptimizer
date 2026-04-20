const mongoose = require("mongoose");
const Delivery = require("../models/delivery");
const {
  createRoutePlanFromOrderedDeliveries,
  optimizeDeliveryRoute,
} = require("../utils/dijkstra");
const { optimizeWithAStar } = require("../utils/astar");
const { buildRouteAlternatives } = require("../utils/routeAlternatives");

let inMemoryDeliveries = [];

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const normalizeDelivery = (delivery) => ({
  _id: delivery._id?.toString?.() || delivery._id,
  name: delivery.name,
  address: delivery.address || delivery.name,
  origin: delivery.origin || "Central Sorting Hub",
  destination: delivery.destination || delivery.name,
  originLat:
    delivery.originLat === null || delivery.originLat === undefined
      ? null
      : Number(delivery.originLat),
  originLng:
    delivery.originLng === null || delivery.originLng === undefined
      ? null
      : Number(delivery.originLng),
  postalCode: delivery.postalCode || "",
  lat: Number(delivery.lat),
  lng: Number(delivery.lng),
  priority: delivery.priority || "medium",
  volume: Number(delivery.volume || 1),
  status: delivery.status || "pending",
  createdAt: delivery.createdAt,
  updatedAt: delivery.updatedAt,
});

const getAllDeliveries = async (_req, res) => {
  const deliveries = isDatabaseReady()
    ? await Delivery.find().sort({ createdAt: 1 }).lean()
    : inMemoryDeliveries;

  res.json({
    deliveries: deliveries.map(normalizeDelivery),
  });
};

const createDelivery = async (req, res) => {
  const payload = {
    name: req.body.name,
    address: req.body.address || req.body.name,
    origin: req.body.origin || "Central Sorting Hub",
    destination: req.body.destination || req.body.name,
    originLat:
      req.body.originLat === null || req.body.originLat === undefined
        ? null
        : Number(req.body.originLat),
    originLng:
      req.body.originLng === null || req.body.originLng === undefined
        ? null
        : Number(req.body.originLng),
    postalCode: req.body.postalCode || "",
    lat: Number(req.body.lat),
    lng: Number(req.body.lng),
    priority: req.body.priority || "medium",
    volume: Number(req.body.volume || 1),
    status: req.body.status || "pending",
  };

  if (!payload.name || Number.isNaN(payload.lat) || Number.isNaN(payload.lng)) {
    return res.status(400).json({
      message: "name, lat and lng are required.",
    });
  }

  if (isDatabaseReady()) {
    const delivery = await Delivery.create(payload);

    return res.status(201).json({
      delivery: normalizeDelivery(delivery.toObject()),
    });
  }

  const delivery = {
    ...payload,
    _id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryDeliveries.push(delivery);

  return res.status(201).json({
    delivery: normalizeDelivery(delivery),
  });
};

const deleteDelivery = async (req, res) => {
  const { id } = req.params;

  if (isDatabaseReady()) {
    await Delivery.findByIdAndDelete(id);
  } else {
    inMemoryDeliveries = inMemoryDeliveries.filter((delivery) => delivery._id !== id);
  }

  res.json({ success: true });
};

const optimizeRoute = async (req, res) => {
  const deliveries = req.body.deliveries?.length
    ? req.body.deliveries
    : isDatabaseReady()
      ? await Delivery.find().sort({ createdAt: 1 }).lean()
      : inMemoryDeliveries;

  const normalized = deliveries.map(normalizeDelivery);
  const algorithm = (req.body.algorithm || "dijkstra").toLowerCase();
  const vehicleType = req.body.vehicleType || "van";
  const vehicleCount = Number(req.body.vehicleCount || 1);

  const routePlan =
    algorithm === "astar"
      ? {
          ...createRoutePlanFromOrderedDeliveries(
            optimizeWithAStar(normalized),
            vehicleType,
            vehicleCount,
            "astar-heuristic"
          ),
          summary: "A* heuristic ordering prepared for comparison.",
        }
      : optimizeDeliveryRoute(normalized, {
          vehicleType,
          vehicleCount,
        });

  res.json({
    ...routePlan,
    routeOptions: buildRouteAlternatives(routePlan.deliveries, routePlan.metrics),
  });
};

module.exports = {
  getAllDeliveries,
  createDelivery,
  deleteDelivery,
  optimizeRoute,
};
