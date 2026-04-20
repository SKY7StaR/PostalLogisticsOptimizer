const express = require("express");
const { generateRouteInsights } = require("../controllers/aiCOntroller");

const router = express.Router();

router.post("/route-insights", generateRouteInsights);

module.exports = router;
