import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import OperationsHub from "./pages/OperationsHub";
import { getOperationsModules } from "./data/capstoneModules";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [routePlan, setRoutePlan] = useState({
    deliveries: [],
    route: [],
    clusters: [],
    metrics: {
      totalStops: 0,
      totalDistanceKm: 0,
      estimatedHours: 0,
      totalCost: 0,
      totalVolume: 0,
      vehicleType: "van",
      vehicleCount: 1,
      algorithm: "dijkstra-greedy",
    },
    summary: "Add delivery points to build an optimized postal route.",
  });
  const [aiInsights, setAiInsights] = useState(null);
  const operationsModules = getOperationsModules(routePlan, aiInsights);

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route
          path="/dashboard"
          element={
            <Dashboard
              routePlan={routePlan}
              setRoutePlan={setRoutePlan}
              aiInsights={aiInsights}
              setAiInsights={setAiInsights}
            />
          }
        />

        <Route
          path="/analytics"
          element={<Analytics routePlan={routePlan} aiInsights={aiInsights} />}
        />

        {operationsModules.map((module) => (
          <Route
            key={module.path}
            path={module.path}
            element={
              <OperationsHub
                title={module.title}
                subtitle={module.subtitle}
                routePlan={routePlan}
                aiInsights={aiInsights}
                cards={module.cards}
                sections={module.sections}
                highlights={module.highlights}
              />
            }
          />
        ))}

        <Route path="/" element={<Landing />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
