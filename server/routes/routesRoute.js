const express = require("express");
const {
  getAllDeliveries,
  createDelivery,
  deleteDelivery,
  optimizeRoute,
} = require("../controllers/routeController");

const router = express.Router();

router.get("/deliveries", getAllDeliveries);
router.post("/deliveries", createDelivery);
router.delete("/deliveries/:id", deleteDelivery);
router.post("/optimize-route", optimizeRoute);

module.exports = router;
