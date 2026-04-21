import {
  FaHome,
  FaChartBar,
  FaRobot,
  FaTruck,
  FaClipboardList,
  FaSatelliteDish,
  FaFileAlt,
  FaWarehouse,
  FaProjectDiagram,
  FaUserShield,
  FaFlask,
  FaStopwatch,
  FaExclamationTriangle,
  FaMapMarkedAlt,
  FaUsers,
  FaTools,
  FaChartLine,
} from "react-icons/fa";

export const navItems = [
  { path: "/", name: "Home", icon: <FaHome /> },
  { path: "/dashboard", name: "AI Planner", icon: <FaRobot /> },
  { path: "/analytics", name: "Analytics", icon: <FaChartBar /> },
  { path: "/fleet", name: "Fleet Control", icon: <FaTruck /> },
  { path: "/orders", name: "Orders Queue", icon: <FaClipboardList /> },
  { path: "/tracking", name: "Live Tracking", icon: <FaSatelliteDish /> },
  { path: "/network", name: "Hub Network", icon: <FaWarehouse /> },
  { path: "/simulation", name: "Simulation Lab", icon: <FaFlask /> },
  { path: "/sla", name: "SLA Monitor", icon: <FaStopwatch /> },
  { path: "/risks", name: "Risk Center", icon: <FaExclamationTriangle /> },
  { path: "/coverage", name: "Coverage Map", icon: <FaMapMarkedAlt /> },
  { path: "/customers", name: "Customer Ops", icon: <FaUsers /> },
  { path: "/maintenance", name: "Maintenance", icon: <FaTools /> },
  { path: "/forecast", name: "Demand Forecast", icon: <FaChartLine /> },
  { path: "/security", name: "Security", icon: <FaUserShield /> },
  { path: "/architecture", name: "Architecture", icon: <FaProjectDiagram /> },
  { path: "/reports", name: "Reports", icon: <FaFileAlt /> },
];

const formatCurrency = (value) => `₹ ${Number(value || 0).toFixed(0)}`;
const formatKm = (value) => `${Number(value || 0).toFixed(1)} km`;
const formatHours = (value) => `${Number(value || 0).toFixed(1)} hrs`;

const buildCommonSections = (routePlan) => {
  const deliveries = routePlan.deliveries || [];
  const route = routePlan.route || [];
  const clusters = routePlan.clusters || [];

  return {
    stopRows: deliveries.slice(0, 6).map((delivery) => ({
      label: `${delivery.origin || "Origin"} to ${
        delivery.destination || delivery.name
      }`,
      value: `${delivery.priority} priority • ${delivery.volume} unit(s)`,
    })),
    segmentRows: route.slice(0, 6).map((segment) => ({
      label: `${segment.from} to ${segment.to}`,
      value: `${segment.distanceKm} km`,
    })),
    clusterRows: clusters.slice(0, 6).map((cluster) => ({
      label: `Vehicle ${cluster.vehicle}`,
      value: `${cluster.stops} stops assigned`,
    })),
  };
};

export const getOperationsModules = (routePlan, aiInsights) => {
  const deliveries = routePlan.deliveries || [];
  const metrics = routePlan.metrics || {};
  const highPriorityCount = deliveries.filter(
    (delivery) => delivery.priority === "high"
  ).length;
  const mediumPriorityCount = deliveries.filter(
    (delivery) => delivery.priority === "medium"
  ).length;
  const localCount = deliveries.filter(
    (delivery) => (delivery.legDistanceKm || 0) < 250
  ).length;
  const longHaulCount = deliveries.filter(
    (delivery) => (delivery.legDistanceKm || 0) >= 250
  ).length;
  const common = buildCommonSections(routePlan);
  const aiNotes =
    aiInsights?.recommendations?.slice(0, 4).map((note, index) => ({
      label: `AI Note ${index + 1}`,
      value: note,
    })) || [];

  return [
    {
      path: "/fleet",
      title: "Fleet Control",
      subtitle:
        "Monitor dispatch capacity, route workload, and vehicle balancing with realistic operational summaries.",
      cards: [
        { label: "Vehicles Active", value: routePlan.clusters?.length || 0 },
        { label: "Estimated Hours", value: formatHours(metrics.estimatedHours) },
        { label: "Delivery Reach", value: formatKm(metrics.totalDistanceKm) },
      ],
      sections: [
        { title: "Vehicle Assignments", rows: common.clusterRows },
        {
          title: "Fleet Notes",
          rows: [
            {
              label: "Primary Vehicle Type",
              value: metrics.vehicleType || "van",
            },
            {
              label: "Average Stops per Vehicle",
              value: routePlan.clusters?.length
                ? `${(metrics.totalStops / routePlan.clusters.length).toFixed(1)} stops`
                : "0 stops",
            },
            {
              label: "Operational Cost",
              value: formatCurrency(metrics.totalCost),
            },
          ],
        },
      ],
      highlights: [
        "Shows how routes are split across the active fleet.",
        "Useful for capstone discussion around resource allocation and dispatch planning.",
      ],
    },
    {
      path: "/orders",
      title: "Orders Queue",
      subtitle:
        "Track stop intake, priority distribution, and parcel workload like a real postal order intake console.",
      cards: [
        { label: "Pending Stops", value: metrics.totalStops || 0 },
        { label: "High Priority", value: highPriorityCount },
        { label: "Total Volume", value: metrics.totalVolume || 0 },
      ],
      sections: [
        { title: "Queued Stops", rows: common.stopRows },
        {
          title: "Order Mix",
          rows: [
            { label: "High Priority", value: `${highPriorityCount} stops` },
            { label: "Medium Priority", value: `${mediumPriorityCount} stops` },
            {
              label: "Standard Queue Pressure",
              value:
                metrics.totalStops > 8 ? "High intake window" : "Normal intake window",
            },
          ],
        },
      ],
      highlights: [
        "Connects route planning to postal queue management.",
        "Makes the application feel closer to a delivery operations dashboard.",
      ],
    },
    {
      path: "/tracking",
      title: "Live Tracking",
      subtitle:
        "Review moving-route behavior, stop sequence readiness, and segment coverage like a live dispatch monitor.",
      cards: [
        { label: "Current Coverage", value: formatKm(metrics.totalDistanceKm) },
        { label: "Stops Sequenced", value: deliveries.length || 0 },
        { label: "Fleet Split", value: routePlan.clusters?.length || 0 },
      ],
      sections: [
        { title: "Route Segments", rows: common.segmentRows },
        {
          title: "Tracking Watch",
          rows: [
            {
              label: "Moving Marker",
              value: deliveries.length ? "Active on route map" : "Waiting for stops",
            },
            {
              label: "Longest Segment Risk",
              value:
                routePlan.route?.length
                  ? `${Math.max(...routePlan.route.map((item) => item.distanceKm))} km`
                  : "N/A",
            },
            {
              label: "Tracking Confidence",
              value: deliveries.length > 2 ? "High" : "Limited route depth",
            },
          ],
        },
      ],
      highlights: [
        "Demonstrates route sequencing with moving-vehicle style visualization.",
        "Helps explain real-time monitoring in your project demo.",
      ],
    },
    {
      path: "/network",
      title: "Hub Network",
      subtitle:
        "Present the postal system as a connected hub-and-spoke network with source-to-destination flow visibility.",
      cards: [
        { label: "Network Stops", value: deliveries.length || 0 },
        { label: "Active Hubs", value: Math.max(routePlan.clusters?.length || 0, 1) },
        { label: "Regional Reach", value: formatKm(metrics.totalDistanceKm) },
      ],
      sections: [
        {
          title: "Network Flows",
          rows: common.stopRows,
        },
        {
          title: "Node Insights",
          rows: [
            { label: "Hub Model", value: "Sorting hub to destination routing" },
            { label: "Graph Strategy", value: metrics.algorithm || "dijkstra-greedy" },
            { label: "Coverage Type", value: longHaulCount ? "Mixed local + regional" : "Mostly local" },
          ],
        },
      ],
      highlights: [
        "Good for explaining graph-based logistics architecture in viva.",
        "Supports capstone storytelling around network optimization.",
      ],
    },
    {
      path: "/simulation",
      title: "Simulation Lab",
      subtitle:
        "Use route outputs as realistic experiment scenarios for fleet size, algorithms, and delivery cost behavior.",
      cards: [
        { label: "Primary Algorithm", value: metrics.algorithm || "dijkstra-greedy" },
        { label: "Fleet Size", value: metrics.vehicleCount || 1 },
        { label: "Scenario Cost", value: formatCurrency(metrics.totalCost) },
      ],
      sections: [
        {
          title: "Scenario Assumptions",
          rows: [
            { label: "Vehicle Type", value: metrics.vehicleType || "van" },
            { label: "Average Distance", value: formatKm(metrics.averageDistanceKm) },
            { label: "Estimated Completion", value: formatHours(metrics.estimatedHours) },
          ],
        },
        {
          title: "Experiment Hooks",
          rows: [
            { label: "Algorithm Comparison", value: "Dijkstra vs A* heuristic" },
            { label: "Fleet Tuning", value: "Adjust cluster count and route pressure" },
            { label: "Result Objective", value: "Lower cost with better SLA coverage" },
          ],
        },
      ],
      highlights: [
        "Strengthens the methodology and experimentation part of the project.",
        "Makes the application feel research-backed, not only UI-driven.",
      ],
    },
    {
      path: "/sla",
      title: "SLA Monitor",
      subtitle:
        "Track service-level performance signals such as time, distance spread, and priority handling quality.",
      cards: [
        { label: "Estimated Hours", value: formatHours(metrics.estimatedHours) },
        { label: "Avg Distance", value: formatKm(metrics.averageDistanceKm) },
        { label: "Priority Stops", value: highPriorityCount },
      ],
      sections: [
        {
          title: "Service Indicators",
          rows: [
            {
              label: "On-Time Confidence",
              value:
                metrics.estimatedHours && metrics.estimatedHours < 10
                  ? "Strong"
                  : "Needs monitoring",
            },
            {
              label: "Priority Handling",
              value: highPriorityCount ? "Priority-aware route" : "Standard route",
            },
            {
              label: "Route Spread",
              value: longHaulCount ? "Wide distribution zone" : "Compact service zone",
            },
          ],
        },
        { title: "Segment Watch", rows: common.segmentRows },
      ],
      highlights: [
        "Adds evaluation metrics that capstone reviewers usually expect.",
        "Connects technical optimization with service performance outcomes.",
      ],
    },
    {
      path: "/risks",
      title: "Risk Center",
      subtitle:
        "Surface delivery, fleet, and route risks using realistic operational indicators and AI recommendations.",
      cards: [
        { label: "High-Risk Stops", value: highPriorityCount },
        { label: "Long-Haul Segments", value: longHaulCount },
        { label: "AI Alerts", value: aiNotes.length || 0 },
      ],
      sections: [
        {
          title: "Risk Indicators",
          rows: [
            {
              label: "Priority Exposure",
              value: highPriorityCount ? `${highPriorityCount} urgent stop(s)` : "Low urgency",
            },
            {
              label: "Distance Stress",
              value: longHaulCount ? `${longHaulCount} long segment(s)` : "Low route spread",
            },
            {
              label: "Cost Stress",
              value:
                metrics.totalCost > 15000 ? "High fuel exposure" : "Contained cost band",
            },
          ],
        },
        { title: "AI Risk Notes", rows: aiNotes },
      ],
      highlights: [
        "Adds a decision-support layer beyond route optimization.",
        "Good for demonstrating operational intelligence in the capstone.",
      ],
    },
    {
      path: "/coverage",
      title: "Coverage Map",
      subtitle:
        "Describe service spread with realistic local-vs-regional mix and route depth indicators for postal coverage analysis.",
      cards: [
        { label: "Local Stops", value: localCount },
        { label: "Regional Stops", value: longHaulCount },
        { label: "Coverage Radius", value: formatKm(metrics.totalDistanceKm) },
      ],
      sections: [
        {
          title: "Coverage Mix",
          rows: [
            { label: "Local Deliveries", value: `${localCount} stops` },
            { label: "Regional Deliveries", value: `${longHaulCount} stops` },
            {
              label: "Coverage Character",
              value: longHaulCount > localCount ? "Regional-heavy" : "Local-heavy",
            },
          ],
        },
        { title: "Stop Geography", rows: common.stopRows },
      ],
      highlights: [
        "Useful for explaining reach, service area, and postal accessibility.",
        "Makes the route planner feel like a broader service coverage platform.",
      ],
    },
    {
      path: "/customers",
      title: "Customer Ops",
      subtitle:
        "Show delivery experience metrics and customer-facing readiness signals in a realistic support module.",
      cards: [
        { label: "Destination Points", value: deliveries.length || 0 },
        { label: "Priority Commitments", value: highPriorityCount },
        { label: "Projected ETA", value: formatHours(metrics.estimatedHours) },
      ],
      sections: [
        {
          title: "Service Experience",
          rows: [
            {
              label: "Dispatch Visibility",
              value: deliveries.length ? "Route prepared for status sharing" : "No route prepared",
            },
            {
              label: "Priority Promise",
              value: highPriorityCount ? "Urgent orders prioritized" : "Standard order queue",
            },
            {
              label: "Coverage Experience",
              value: longHaulCount ? "Mixed long-haul customer zone" : "Fast local service zone",
            },
          ],
        },
        { title: "Destination Flow", rows: common.stopRows },
      ],
      highlights: [
        "Broadens the project from logistics-only into service operations.",
        "Helpful when discussing user impact and business value.",
      ],
    },
    {
      path: "/maintenance",
      title: "Maintenance",
      subtitle:
        "Represent readiness checks, fleet health signals, and operational sustainability in a realistic support layer.",
      cards: [
        { label: "Fleet Assets", value: routePlan.clusters?.length || 0 },
        { label: "Usage Intensity", value: metrics.totalStops || 0 },
        { label: "Cost Pressure", value: formatCurrency(metrics.totalCost) },
      ],
      sections: [
        {
          title: "Maintenance Signals",
          rows: [
            {
              label: "Vehicle Load Stress",
              value:
                routePlan.clusters?.length &&
                metrics.totalStops / routePlan.clusters.length > 4
                  ? "Elevated"
                  : "Stable",
            },
            {
              label: "Distance Wear Risk",
              value: metrics.totalDistanceKm > 1500 ? "Review advised" : "Within normal band",
            },
            {
              label: "Operational Cadence",
              value: metrics.estimatedHours > 12 ? "Extended duty cycle" : "Balanced duty cycle",
            },
          ],
        },
        { title: "Vehicle Assignment Overview", rows: common.clusterRows },
      ],
      highlights: [
        "Adds infrastructure thinking beyond pure routing.",
        "Makes the capstone feel closer to a full logistics ecosystem.",
      ],
    },
    {
      path: "/forecast",
      title: "Demand Forecast",
      subtitle:
        "Estimate future pressure using current stop mix, volume trends, and cost behavior as realistic forecasting indicators.",
      cards: [
        { label: "Current Volume", value: metrics.totalVolume || 0 },
        { label: "Stop Demand", value: metrics.totalStops || 0 },
        { label: "Forecast Signal", value: metrics.totalStops > 8 ? "Rising" : "Stable" },
      ],
      sections: [
        {
          title: "Forecast Inputs",
          rows: [
            { label: "Parcel Volume", value: `${metrics.totalVolume || 0} unit(s)` },
            { label: "Stop Count", value: `${metrics.totalStops || 0} stops` },
            { label: "Cost Trend Indicator", value: formatCurrency(metrics.totalCost) },
          ],
        },
        {
          title: "Projected Outlook",
          rows: [
            {
              label: "Next Dispatch Window",
              value: metrics.totalStops > 10 ? "Peak dispatch expected" : "Normal dispatch expected",
            },
            {
              label: "Fleet Readiness Need",
              value:
                metrics.vehicleCount > 2 ? "Maintain multi-vehicle posture" : "Single-team readiness",
            },
            {
              label: "Demand Pattern",
              value: highPriorityCount > 2 ? "Priority-heavy demand" : "Balanced demand",
            },
          ],
        },
      ],
      highlights: [
        "Gives the capstone a predictive angle beyond current-state analytics.",
        "Helps justify AI and data-driven extensions in future scope.",
      ],
    },
    {
      path: "/security",
      title: "Security and Governance",
      subtitle:
        "Outline safer data handling, controlled dispatch workflows, and trustworthy AI-assisted decision support.",
      cards: [
        { label: "Data Mode", value: "Mongo-ready + API controlled" },
        { label: "AI Safety Layer", value: aiInsights ? "Active" : "Fallback Ready" },
        { label: "Workflow Status", value: "Governed" },
      ],
      sections: [
        {
          title: "Governance Signals",
          rows: [
            { label: "API Layer", value: "Centralized request flow through Express" },
            { label: "Fallback Safety", value: "Rules engine available when AI key is absent" },
            { label: "Data Persistence", value: "MongoDB or in-memory fallback" },
          ],
        },
        {
          title: "Operational Trust",
          rows: [
            { label: "Decision Review", value: "AI output paired with route metrics" },
            { label: "Module Separation", value: "Planner, analytics, reports, and ops modules" },
            { label: "Capstone Value", value: "Responsible AI system narrative" },
          ],
        },
      ],
      highlights: [
        "Adds governance and responsibility framing to the project.",
        "Useful in documentation and viva discussion on safe AI usage.",
      ],
    },
    {
      path: "/architecture",
      title: "System Architecture",
      subtitle:
        "Present the complete stack, optimization core, and AI integration as a structured capstone system design.",
      cards: [
        { label: "Frontend", value: "React Control Panels" },
        { label: "Backend", value: "Express REST APIs" },
        { label: "Optimization Core", value: "Dijkstra + A*" },
      ],
      sections: [
        {
          title: "Architecture Layers",
          rows: [
            { label: "Presentation Layer", value: "Landing, dashboard, analytics, and operations modules" },
            { label: "Service Layer", value: "Axios-based API calls and route planning endpoints" },
            { label: "Intelligence Layer", value: "AI.js route brief + rules fallback" },
          ],
        },
        {
          title: "Technical Narrative",
          rows: [
            { label: "Data Model", value: "Stops include origin, destination, priority, and volume" },
            { label: "Routing Logic", value: metrics.algorithm || "dijkstra-greedy" },
            { label: "Extensibility", value: "Capstone-ready for auth, IoT, and predictive modules" },
          ],
        },
      ],
      highlights: [
        "Turns the project into a strong system-design discussion.",
        "Useful during final presentation and architecture explanation.",
      ],
    },
    {
      path: "/reports",
      title: "Reports",
      subtitle:
        "Summarize the route plan into presentation-ready metrics, operational insights, and review notes.",
      cards: [
        { label: "Total Cost", value: formatCurrency(metrics.totalCost) },
        { label: "Avg Distance", value: formatKm(metrics.averageDistanceKm) },
        { label: "Vehicle Type", value: metrics.vehicleType || "van" },
      ],
      sections: [
        {
          title: "Report Snapshot",
          rows: [
            { label: "Stops Covered", value: `${metrics.totalStops || 0} stops` },
            { label: "Estimated Completion", value: formatHours(metrics.estimatedHours) },
            { label: "Route Spread", value: formatKm(metrics.totalDistanceKm) },
          ],
        },
        {
          title: "Review Notes",
          rows: aiNotes.length
            ? aiNotes
            : [
                { label: "AI Brief", value: "Generate an AI brief from the planner for report insights." },
              ],
        },
      ],
      highlights: [
        "Ready for screenshots, report chapters, and faculty demos.",
        "Converts route outputs into clear capstone reporting language.",
      ],
    },
  ];
};
