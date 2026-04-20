const buildFallbackInsights = (routePlan, context = {}) => {
  const { metrics, deliveries, clusters } = routePlan;
  const highestPriority = deliveries.filter((delivery) => delivery.priority === "high");
  const longestLeg = deliveries.reduce(
    (currentLongest, delivery) =>
      delivery.legDistanceKm > currentLongest.legDistanceKm
        ? delivery
        : currentLongest,
    { legDistanceKm: 0, name: "N/A" }
  );

  return {
    headline: context.surface
      ? `${context.surface} assistant is running in fallback mode.`
      : "AI routing assistant is running in fallback mode.",
    summary: `The route covers ${metrics.totalStops} stops over ${metrics.totalDistanceKm} km with an estimated completion time of ${metrics.estimatedHours} hours.${context.surface ? ` This view is tailored for ${context.surface}.` : ""}`,
    recommendations: [
      highestPriority.length
        ? `Dispatch high-priority consignments first: ${highestPriority
            .map((delivery) => delivery.name)
            .join(", ")}.`
        : "No high-priority consignments detected. Standard dispatch order is acceptable.",
      longestLeg.legDistanceKm
        ? `Review the longest handoff near ${longestLeg.name} (${longestLeg.legDistanceKm} km) for fuel and traffic risk.`
        : "Add more stops to generate segment-level route risk analysis.",
      clusters.length > 1
        ? `Balance the fleet by checking vehicle clusters: ${clusters
            .map((cluster) => `V${cluster.vehicle}: ${cluster.stops} stops`)
            .join(" | ")}.`
        : "A single vehicle is sufficient for the current route shape.",
    ],
  };
};

const generateRouteInsights = async (req, res) => {
  const routePlan = req.body.routePlan;
  const context = req.body.context || {};

  if (!routePlan || !routePlan.metrics) {
    return res.status(400).json({
      message: "routePlan payload is required.",
    });
  }

  let aiSdkAvailable = false;

  try {
    const { generateText } = require("ai");
    const { openai } = require("@ai-sdk/openai");

    if (process.env.OPENAI_API_KEY) {
      aiSdkAvailable = true;

      const prompt = `You are assisting a postal logistics control tower.
Summarize this route plan in JSON with keys headline, summary, recommendations.
Context: ${JSON.stringify(context)}
Route plan: ${JSON.stringify(routePlan)}`;

      const { text } = await generateText({
        model: openai("gpt-4.1-mini"),
        prompt,
      });

      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        source: "ai-sdk",
      });
    }
  } catch (_error) {
    aiSdkAvailable = false;
  }

  const fallbackInsights = buildFallbackInsights(routePlan, context);

  res.json({
    ...fallbackInsights,
    source: aiSdkAvailable ? "ai-sdk-fallback" : "rules-engine",
  });
};

module.exports = {
  generateRouteInsights,
};
