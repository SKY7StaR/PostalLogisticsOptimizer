import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaRoute,
  FaChartLine,
  FaTruck,
  FaBrain,
  FaShieldAlt,
  FaBoxes,
  FaSatelliteDish,
  FaNetworkWired,
} from "react-icons/fa";
import "./Landing.css";

const featureCards = [
  {
    icon: <FaRoute />,
    title: "Dijkstra Route Engine",
    text: "Shortest-path delivery sequencing with route cost visibility for postal operations.",
  },
  {
    icon: <FaBrain />,
    title: "AI Dispatch Briefs",
    text: "AI.js powered summaries, recommendations, and route review support for teams.",
  },
  {
    icon: <FaTruck />,
    title: "Fleet Coordination",
    text: "Vehicle allocation, stop clustering, and operational readiness tracking in one view.",
  },
  {
    icon: <FaChartLine />,
    title: "Decision Analytics",
    text: "Distance, ETA, cost, and utilization metrics ready for capstone demonstrations.",
  },
];

const innovationPillars = [
  "MERN architecture with API-first design",
  "AI-enhanced logistics recommendations",
  "Postal stop flow from source to destination",
  "Capstone-ready analytics and control modules",
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="gradient-bg"></div>
      <div className="mesh-grid"></div>

      <section className="landing-hero">
        <div className="landing-content">
          <motion.p
            className="landing-kicker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Capstone Project • Postal Logistics Intelligence Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Build smarter postal movement with AI-assisted routing, fleet control,
            and delivery intelligence.
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
          >
            PostalX combines MERN, AI.js, Dijkstra-based optimization, A* comparison,
            live route monitoring, and dispatch analytics into a final-year project
            that feels production-inspired.
          </motion.p>

          <motion.div
            className="cta-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button onClick={() => navigate("/dashboard")}>Open Command Center</button>
            <button className="secondary" onClick={() => navigate("/analytics")}>
              View Analytics
            </button>
          </motion.div>

          <div className="hero-pills">
            {innovationPillars.map((pillar) => (
              <span key={pillar}>{pillar}</span>
            ))}
          </div>
        </div>

        <motion.div
          className="hero-panel"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="hero-panel-header">
            <p>Operational Snapshot</p>
            <span>PostalX v1</span>
          </div>

          <div className="hero-metrics">
            <div>
              <strong>4</strong>
              <span>Core layers</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Algorithms</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Planning support</span>
            </div>
          </div>

          <div className="hero-flow-card">
            <p>Typical stop flow</p>
            <h3>Sorting Hub → City Center → Last Mile Delivery</h3>
            <div className="flow-line">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="hero-panel-list">
            <div>
              <FaBoxes />
              <span>Parcel queue intelligence</span>
            </div>
            <div>
              <FaSatelliteDish />
              <span>Live route monitoring</span>
            </div>
            <div>
              <FaShieldAlt />
              <span>Operational risk visibility</span>
            </div>
            <div>
              <FaNetworkWired />
              <span>Capstone-grade system design</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="feature-section">
        {featureCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="feature-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * index, duration: 0.45 }}
          >
            {card.icon}
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </motion.div>
        ))}
      </section>

      <section className="capstone-section">
        <div className="capstone-copy">
          <p className="section-kicker">Why it stands out</p>
          <h2>Designed to present well in demos, reports, and viva discussions.</h2>
          <p>
            This system is now structured like a polished capstone: strong landing page,
            command center workflow, analytics, AI brief generation, multiple operations
            modules, and a premium transition layer for user actions.
          </p>
        </div>

        <div className="capstone-grid">
          <div className="capstone-item">
            <h3>Problem Focus</h3>
            <p>Reduce route inefficiency, improve postal coordination, and prioritize deliveries.</p>
          </div>
          <div className="capstone-item">
            <h3>Technical Stack</h3>
            <p>React, Express, Mongo-ready persistence, REST APIs, AI.js, Dijkstra, and A*.</p>
          </div>
          <div className="capstone-item">
            <h3>Outcome</h3>
            <p>Capable of showcasing planning, optimization, analytics, and AI-enhanced decision support.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
