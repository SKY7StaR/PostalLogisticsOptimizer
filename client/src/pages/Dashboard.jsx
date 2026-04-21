import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import MapView from "../components/MapView";
import Loader from "../components/Loader";
import {
  FaMotorcycle,
  FaTruck,
  FaShuttleVan,
  FaMagic,
  FaRoute,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  createDelivery,
  deleteDelivery,
  fetchAiInsights,
  fetchDeliveries,
  optimizeRoutePlan,
} from "../services/api";

const Dashboard = ({
  routePlan,
  setRoutePlan,
  aiInsights,
  setAiInsights,
}) => {
  const premiumLoaderMinMs = 1200;
  const [loading, setLoading] = useState(false);
  const [loaderContent, setLoaderContent] = useState({
    title: "Preparing the logistics network",
    subtitle: "Optimizing routes, syncing fleet intelligence, and refreshing insights.",
  });
  const [mode, setMode] = useState("van");
  const [suggestions, setSuggestions] = useState([]);
  const [vehicles, setVehicles] = useState(2);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [form, setForm] = useState({
    origin: "Central Sorting Hub",
    destination: "",
    name: "",
    lat: "",
    lng: "",
    postalCode: "",
    priority: "medium",
    volume: 1,
  });

  const deliveries = routePlan.deliveries || [];
  const metrics = routePlan.metrics || {};
  const routeOptions = useMemo(() => routePlan.routeOptions || [], [routePlan.routeOptions]);

  const refreshRoutePlan = async (deliveryOverrides) => {
    const currentDeliveries = deliveryOverrides || (await fetchDeliveries());
    const optimized = await optimizeRoutePlan({
      deliveries: currentDeliveries,
      vehicleType: mode,
      vehicleCount: vehicles,
      algorithm,
    });

    setRoutePlan(optimized);
    return optimized;
  };

  const runWithLoader = async (title, subtitle, task) => {
    const startedAt = Date.now();
    setLoaderContent({ title, subtitle });
    setLoading(true);

    try {
      return await task();
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(premiumLoaderMinMs - elapsed, 0);

      if (remaining) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRoutePlan = async () => {
      try {
        await runWithLoader(
          "Launching the control tower",
          "Connecting delivery intelligence, route analytics, and fleet signals.",
          async () => {
            await refreshRoutePlan();
          }
        );
      } catch (_error) {
        toast.error("Unable to connect to the logistics API.");
      }
    };

    loadRoutePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!deliveries.length) {
      return;
    }

    refreshRoutePlan(deliveries).catch(() => {
      toast.error("Unable to refresh the route with the selected settings.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, vehicles, algorithm]);

  useEffect(() => {
    if (routeOptions.length) {
      setSelectedRouteId((current) =>
        routeOptions.some((option) => option.id === current)
          ? current
          : routeOptions[0].id
      );
    }
  }, [routeOptions]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSearch = async (event) => {
    const value = event.target.value;
    setForm({ ...form, name: value, destination: value });

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
    );
    const data = await response.json();
    setSuggestions(data);
  };

  const selectLocation = (place) => {
    setForm({
      origin: form.origin,
      destination: place.display_name,
      name: place.display_name,
      lat: place.lat,
      lng: place.lon,
      postalCode: "",
      priority: "medium",
      volume: 1,
    });
    setSuggestions([]);
  };

  const addLocation = async () => {
    if (!form.name || !form.lat || !form.lng) {
      toast.error("Fill all fields");
      return;
    }

    try {
      await runWithLoader(
        "Adding a new delivery stop",
        "Registering stop metadata and rebuilding the optimized dispatch sequence.",
        async () => {
          const originLookup = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              form.origin
            )}&limit=1`
          );
          const [originMatch] = await originLookup.json();

          await createDelivery({
            ...form,
            name: form.destination || form.name,
            address: form.destination || form.name,
            origin: form.origin,
            destination: form.destination || form.name,
            originLat: originMatch ? parseFloat(originMatch.lat) : null,
            originLng: originMatch ? parseFloat(originMatch.lon) : null,
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
            volume: Number(form.volume),
          });

          await refreshRoutePlan();
        }
      );

      setAiInsights(null);
      setForm({
        origin: "Central Sorting Hub",
        destination: "",
        name: "",
        lat: "",
        lng: "",
        postalCode: "",
        priority: "medium",
        volume: 1,
      });
      toast.success("Delivery added");
    } catch (_error) {
      toast.error("Unable to save this delivery.");
    }
  };

  const removeLocation = async (id) => {
    try {
      await runWithLoader(
        "Removing delivery stop",
        "Rebalancing the route plan and refreshing fleet assignments.",
        async () => {
          await deleteDelivery(id);
          await refreshRoutePlan();
        }
      );
      setAiInsights(null);
    } catch (_error) {
      toast.error("Unable to remove this delivery.");
    }
  };

  const exportCSV = () => {
    if (deliveries.length === 0) {
      return;
    }

    const rows = [
      ["Sequence", "Flow", "Latitude", "Longitude", "Priority", "Volume"],
      ...deliveries.map((delivery) => [
        delivery.sequence,
        `${delivery.origin || "Origin"} -> ${
          delivery.destination || delivery.name
        }`,
        delivery.lat,
        delivery.lng,
        delivery.priority,
        delivery.volume,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((entry) => entry.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "routes.csv";
    link.click();

    toast.success("Exported CSV");
  };

  const runOptimization = async () => {
    try {
      const optimized = await runWithLoader(
        "Running route optimization",
        "Comparing route costs, sequencing deliveries, and preparing a sharper dispatch plan.",
        async () => refreshRoutePlan()
      );
      setAiInsights(null);
      toast.success(`Route optimized using ${optimized.metrics.algorithm}.`);
    } catch (_error) {
      toast.error("Unable to optimize the route.");
    }
  };

  const runAiInsights = async () => {
    try {
      const insights = await runWithLoader(
        "Generating AI dispatch brief",
        "Analyzing cost, stop priority, and fleet utilization for smarter operations.",
        async () => fetchAiInsights(routePlan, { surface: "AI Planner" })
      );
      setAiInsights(insights);
      toast.success("AI insights generated");
    } catch (_error) {
      toast.error("Unable to generate AI insights.");
    }
  };

  return (
    <div className="dashboard">
      {loading && (
        <Loader
          title={loaderContent.title}
          subtitle={loaderContent.subtitle}
        />
      )}

      <h1>Postal Logistics Command Center</h1>

      <div className="hero-card">
        <div>
          <p className="eyebrow">MERN + AI.js + Dijkstra</p>
          <h2>Plan postal deliveries, optimize routes, and generate dispatch advice.</h2>
          <p className="hero-copy">{routePlan.summary}</p>
        </div>
        <button className="primary-action" onClick={runAiInsights}>
          <FaMagic /> Generate AI Brief
        </button>
      </div>

      <div className="form">
        <input
          name="origin"
          placeholder="From"
          value={form.origin}
          onChange={handleChange}
        />

        <div className="search-box">
          <input
            name="name"
            placeholder="Search Destination"
            value={form.name}
            onChange={handleSearch}
          />

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion) => (
                <div
                  key={`${suggestion.place_id}-${suggestion.lat}`}
                  onClick={() => selectLocation(suggestion)}
                >
                  {suggestion.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          name="destination"
          placeholder="To"
          value={form.destination}
          onChange={handleChange}
        />

        <input
          name="lat"
          placeholder="Latitude"
          value={form.lat}
          onChange={handleChange}
        />
        <input
          name="lng"
          placeholder="Longitude"
          value={form.lng}
          onChange={handleChange}
        />
        <input
          name="postalCode"
          placeholder="Postal Code"
          value={form.postalCode}
          onChange={handleChange}
        />
        <input
          name="volume"
          type="number"
          min="1"
          placeholder="Parcel Volume"
          value={form.volume}
          onChange={handleChange}
        />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button onClick={addLocation}>Add</button>
      </div>

      <div className="route-entry-preview">
        <span>Current stop flow</span>
        <strong>
          {form.origin || "Origin hub"} to {form.destination || form.name || "Destination"}
        </strong>
      </div>

      <div className="toolbar">
        <button onClick={exportCSV} className="export-btn">
          Export CSV
        </button>
        <button onClick={runOptimization} className="optimize-btn">
          Recalculate Route
        </button>
      </div>

      <div className="mode-select">
        <button
          className={mode === "bike" ? "active-mode" : ""}
          onClick={() => setMode("bike")}
        >
          <FaMotorcycle /> Bike
        </button>
        <button
          className={mode === "van" ? "active-mode" : ""}
          onClick={() => setMode("van")}
        >
          <FaShuttleVan /> Van
        </button>
        <button
          className={mode === "truck" ? "active-mode" : ""}
          onClick={() => setMode("truck")}
        >
          <FaTruck /> Truck
        </button>
      </div>

      <div className="filters">
        <div className="fleet-box">
          <h3>Fleet Size</h3>
          <input
            type="number"
            min="1"
            max="10"
            value={vehicles}
            onChange={(event) => setVehicles(Number(event.target.value))}
          />
        </div>

        <div className="fleet-box">
          <h3>Algorithm</h3>
          <select
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value)}
          >
            <option value="dijkstra">Dijkstra</option>
            <option value="astar">A* Heuristic</option>
          </select>
        </div>
      </div>

      <div className="stats">
        <div className="stat-box">
          <h3>Total Stops</h3>
          <p>{metrics.totalStops || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Total Distance</h3>
          <p>{metrics.totalDistanceKm || 0} km</p>
        </div>
        <div className="stat-box">
          <h3>Estimated Time</h3>
          <p>{metrics.estimatedHours || 0} hrs</p>
        </div>
        <div className="stat-box">
          <h3>Total Cost</h3>
          <p>₹ {metrics.totalCost || 0}</p>
        </div>
      </div>

      {aiInsights && (
        <div className="insight-panel">
          <h3>{aiInsights.headline}</h3>
          <p>{aiInsights.summary}</p>
          <div className="recommendation-list">
            {aiInsights.recommendations?.map((recommendation) => (
              <div key={recommendation} className="recommendation-item">
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      )}

      <MapView
        locations={deliveries}
        mode={mode}
        routeOptions={routeOptions}
        selectedRouteId={selectedRouteId}
      />

      <div className="route-breakdown">
        <div className="route-box">
          <h3>Alternative Route Options</h3>
          {routeOptions.length ? (
            <div className="route-options-grid">
              {routeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={
                    selectedRouteId === option.id
                      ? "route-option-card active-route-option"
                      : "route-option-card"
                  }
                  onClick={() => setSelectedRouteId(option.id)}
                >
                  <div className="route-option-head">
                    <strong>{option.name}</strong>
                    <FaRoute />
                  </div>
                  <span>{option.checkpoints.length} checkpoints</span>
                  <p>{option.totalDistanceKm} km</p>
                  <small>
                    {option.estimatedHours} hrs • ₹ {option.estimatedCost}
                  </small>
                  <em>{option.reference}</em>
                </button>
              ))}
            </div>
          ) : (
            <p>Add at least one stop to compare route alternatives.</p>
          )}
        </div>

        <div className="route-box">
          <h3>Selected Route Checkpoints</h3>
          {routeOptions.find((option) => option.id === selectedRouteId)
            ?.checkpoints?.length ? (
            routeOptions
              .find((option) => option.id === selectedRouteId)
              .checkpoints.map((checkpoint, index) => (
                <p key={`${checkpoint.name}-${index}`}>
                  {index + 1}. {checkpoint.name}
                </p>
              ))
          ) : (
            <p>Choose a route option to inspect its checkpoints.</p>
          )}
        </div>
      </div>

      <div className="list">
        {deliveries.map((delivery) => (
          <div key={delivery._id} className="list-item">
            <div>
              <p>
                Stop {delivery.sequence}. {delivery.origin || "Origin"} to{" "}
                {delivery.destination || delivery.name}
              </p>
              <span>
                {delivery.lat}, {delivery.lng} | {delivery.priority} priority |{" "}
                {delivery.volume} parcel unit(s)
              </span>
            </div>
            <button
              className="delete-btn"
              onClick={() => removeLocation(delivery._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
