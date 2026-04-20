const express = require("express");
const cors = require("cors");
const routesRoute = require("./routes/routesRoute");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "postal-logistics-server",
  });
});

app.use("/api/routes", routesRoute);
app.use("/api/ai", aiRoutes);

module.exports = app;
