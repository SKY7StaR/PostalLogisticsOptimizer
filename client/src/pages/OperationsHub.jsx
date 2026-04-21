import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Loader from "../components/Loader";
import { fetchAiInsights } from "../services/api";
import "./OperationsHub.css";

const sectionLoaderMinMs = 1200;
const chartColors = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444"];

const parseNumericValue = (value) => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number.parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toBarWidth = (value, maxValue) => {
  if (!maxValue) {
    return 20;
  }

  return Math.min(100, Math.max(20, (value / maxValue) * 100));
};

const OperationsHub = ({
  title,
  subtitle,
  routePlan,
  aiInsights,
  cards,
  sections = [],
  highlights = [],
}) => {
  const deliveries = routePlan.deliveries || [];
  const location = useLocation();
  const [sectionLoading, setSectionLoading] = useState(true);
  const [moduleInsights, setModuleInsights] = useState(null);

  useEffect(() => {
    const startedAt = Date.now();
    let mounted = true;
    setSectionLoading(true);

    const loadModuleInsights = async () => {
      try {
        const response = await fetchAiInsights(routePlan, {
          surface: title,
          sectionTitles: sections.map((section) => section.title),
        });

        if (mounted) {
          setModuleInsights(response);
        }
      } catch (_error) {
        if (mounted) {
          setModuleInsights(null);
        }
      }
    };

    loadModuleInsights();

    const timer = setTimeout(() => {
      if (mounted && Date.now() - startedAt >= sectionLoaderMinMs) {
        setSectionLoading(false);
      }
    }, sectionLoaderMinMs);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [location.pathname, routePlan, sections, title]);

  const cardMax = useMemo(
    () => Math.max(...cards.map((card) => parseNumericValue(card.value)), 1),
    [cards]
  );

  const timelineStops = deliveries.slice(0, 6);

  const cardChartData = cards.map((card) => ({
    name: card.label.slice(0, 12),
    value: parseNumericValue(card.value),
    label: card.label,
  }));

  const priorityChartData = [
    {
      name: "High",
      value: deliveries.filter((delivery) => delivery.priority === "high").length,
    },
    {
      name: "Medium",
      value: deliveries.filter((delivery) => delivery.priority === "medium").length,
    },
    {
      name: "Low",
      value: deliveries.filter((delivery) => delivery.priority === "low").length,
    },
  ].filter((item) => item.value > 0);

  const references = [
    `Reference: derived from ${routePlan.metrics?.algorithm || "dijkstra-greedy"} route metrics and current checkpoint order.`,
    `Reference: section analytics are computed from ${deliveries.length} mapped stop(s) and ${sections.length} operational section(s).`,
    `Reference: ${moduleInsights ? "AI-generated module brief refreshed for this page." : "fallback briefing used when AI response is unavailable."}`,
  ];

  return (
    <div className="operations-hub">
      {sectionLoading && (
        <Loader
          title={`Opening ${title}`}
          subtitle="Rendering operational intelligence, route signals, charts, and AI-assisted analysis."
        />
      )}

      <motion.div
        className="operations-hero"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <p className="operations-kicker">Postal Control Room</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </motion.div>

      <div className="operations-grid">
        {cards.map((card, index) => {
          const numericValue = parseNumericValue(card.value);
          const width = toBarWidth(numericValue, cardMax);

          return (
            <motion.div
              key={card.label}
              className="operations-card"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <div className="operations-card-head">
                <h3>{card.label}</h3>
                <span>{index + 1}</span>
              </div>
              <p>{card.value}</p>
              <div className="operations-card-bar">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ delay: 0.2 + index * 0.08, duration: 0.6 }}
                ></motion.span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="operations-layout">
        <motion.div
          className="operations-panel"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.42 }}
        >
          <div className="operations-panel-head">
            <h2>Current Stop Flow</h2>
            <span>{timelineStops.length} staged stop(s)</span>
          </div>

          {timelineStops.length ? (
            <div className="operations-timeline">
              {timelineStops.map((delivery) => (
                <motion.div
                  key={delivery._id}
                  className="operations-timeline-item"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="timeline-marker">
                    <span>{delivery.sequence}</span>
                  </div>
                  <div className="timeline-copy">
                    <strong>
                      {delivery.origin || "Origin"} to{" "}
                      {delivery.destination || delivery.name}
                    </strong>
                    <p>
                      {delivery.priority} priority • {delivery.volume} parcel unit(s)
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p>Add stops in the planner to populate this section.</p>
          )}
        </motion.div>

        <motion.div
          className="operations-panel"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.42 }}
        >
          <div className="operations-panel-head">
            <h2>AI Dispatch Notes</h2>
            <span>{moduleInsights?.recommendations?.length || aiInsights?.recommendations?.length || 0} signals</span>
          </div>
          <p className="operations-summary">
            {moduleInsights?.summary || aiInsights?.summary || routePlan.summary}
          </p>
          <div className="operations-tags">
            {(moduleInsights?.recommendations ||
              aiInsights?.recommendations ||
              []).map((recommendation) => (
              <span key={recommendation}>{recommendation}</span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="operations-sections-grid">
        <motion.div
          className="operations-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="operations-panel-head">
            <h2>Metric Distribution</h2>
            <span>animated chart</span>
          </div>
          <div className="operations-chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cardChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {cardChartData.map((entry, index) => (
                    <Cell
                      key={`${entry.label}-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="operations-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="operations-panel-head">
            <h2>Priority Mix</h2>
            <span>route profile</span>
          </div>
          <div className="operations-chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={priorityChartData.length ? priorityChartData : [{ name: "None", value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {(priorityChartData.length ? priorityChartData : [{ name: "None", value: 1 }]).map(
                    (entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {sections.length > 0 && (
        <div className="operations-sections-grid">
          {sections.map((section, sectionIndex) => {
            const maxRowValue = Math.max(
              ...((section.rows || []).map((row) => parseNumericValue(row.value))),
              1
            );

            return (
              <motion.div
                key={section.title}
                className="operations-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.08, duration: 0.4 }}
              >
                <div className="operations-panel-head">
                  <h2>{section.title}</h2>
                  <span>{section.rows?.length || 0} data points</span>
                </div>
                {section.rows?.length ? (
                  <div className="operations-detail-list">
                    {section.rows.map((row) => {
                      const numericValue = parseNumericValue(row.value);
                      const width = toBarWidth(numericValue, maxRowValue);

                      return (
                        <div
                          key={`${section.title}-${row.label}`}
                          className="operations-detail-row"
                        >
                          <div className="operations-detail-copy">
                            <span>{row.label}</span>
                            <strong>{row.value}</strong>
                          </div>
                          <div className="operations-detail-meter">
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ duration: 0.65 }}
                            ></motion.span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>No records available.</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.div
        className="operations-panel operations-reference-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="operations-panel-head">
          <h2>Reference Frame</h2>
          <span>validity notes</span>
        </div>
        <div className="operations-reference-list">
          {references.map((reference) => (
            <div key={reference} className="operations-reference-card">
              {reference}
            </div>
          ))}
        </div>
      </motion.div>

      {highlights.length > 0 && (
        <motion.div
          className="operations-panel operations-highlights"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="operations-panel-head">
            <h2>Capstone Highlights</h2>
            <span>{highlights.length} showcase points</span>
          </div>
          <div className="operations-highlight-grid">
            {highlights.map((highlight, index) => (
              <div key={highlight} className="operations-highlight-card">
                <span>{index + 1}</span>
                <p>{highlight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OperationsHub;
