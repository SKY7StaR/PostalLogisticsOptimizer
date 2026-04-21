import "./Analytics.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const EMPTY_DELIVERIES = [];

const Analytics = ({ routePlan, aiInsights }) => {
  const deliveries = routePlan.deliveries || EMPTY_DELIVERIES;
  const metrics = routePlan.metrics || {};
  const totalStops = metrics.totalStops || 0;
  const totalDistance = metrics.totalDistanceKm || 0;
  const totalTime = metrics.estimatedHours || 0;
  const cost = metrics.totalCost || 0;

  const data = deliveries.map((delivery) => ({
    name: delivery.name.slice(0, 8),
    order: delivery.sequence,
  }));

  const avgDistance =
    totalStops > 0 ? (totalDistance / totalStops).toFixed(1) : 0;

  const efficiency =
    totalStops > 0
      ? Math.max(40, Math.round(100 - (cost / Math.max(totalStops, 1)) * 0.4))
      : 0;

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, [deliveries]);

  return (
    <div className="analytics">
      <h1>Analytics Dashboard</h1>

      <div className="analytics-grid">
        <motion.div whileHover={{ scale: 1.05 }} className="analytics-card">
          <h3>Total Stops</h3>
          <p>{totalStops}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="analytics-card">
          <h3>Total Distance</h3>
          <p>{totalDistance} km</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="analytics-card">
          <h3>Estimated Time</h3>
          <p>{totalTime} hrs</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="analytics-card">
          <h3>Total Cost</h3>
          <p>₹ {cost}</p>
        </motion.div>
      </div>

      <div className="chart-box">
        <h3>Route Order</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />

            <Bar
              dataKey="order"
              isAnimationActive={animate}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="route-box">
        <h3>Route Breakdown</h3>
        {deliveries.map((delivery, index) => (
          <p key={delivery._id || index}>
            {index + 1}. {delivery.origin || "Origin"} to{" "}
            {delivery.destination || delivery.name} ({delivery.legDistanceKm || 0} km
            from previous stop)
          </p>
        ))}
      </div>

      <div className="insights">
        <div className="insight-card">
          <h4>Efficiency Score</h4>
          <p>{efficiency}% Optimized</p>
        </div>

        <div className="insight-card">
          <h4>Avg Distance / Stop</h4>
          <p>{avgDistance} km</p>
        </div>

        <div className="insight-card">
          <h4>Delivery Type</h4>
          <p>
            {totalDistance > 1000 ? "Regional Distribution" : "Local Distribution"}
          </p>
        </div>

        <div className="insight-card">
          <h4>Fuel Impact</h4>
          <p>{(cost * 0.35).toFixed(0)} ₹ approx</p>
        </div>
      </div>

      <div className="extra-analytics">
        <h3>Performance Summary</h3>

        <div className="extra-grid">
          <div>
            <p>Stops Density</p>
            <strong>{totalStops > 3 ? "High" : "Low"}</strong>
          </div>

          <div>
            <p>Speed Efficiency</p>
            <strong>{totalTime < 10 ? "Fast" : "Moderate"}</strong>
          </div>

          <div>
            <p>Cost Efficiency</p>
            <strong>{cost < 5000 ? "Optimized" : "Expensive"}</strong>
          </div>

          <div>
            <p>Coverage</p>
            <strong>{totalDistance > 2000 ? "Wide Area" : "Local Area"}</strong>
          </div>
        </div>
      </div>

      {aiInsights && (
        <div className="extra-analytics">
          <h3>AI Dispatch Brief</h3>
          <p>{aiInsights.summary}</p>
          <div className="ai-brief-list">
            {aiInsights.recommendations?.map((recommendation) => (
              <div key={recommendation} className="ai-brief-item">
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
