import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

export const fetchDeliveries = async () => {
  const response = await api.get("/routes/deliveries");
  return response.data.deliveries;
};

export const createDelivery = async (payload) => {
  const response = await api.post("/routes/deliveries", payload);
  return response.data.delivery;
};

export const deleteDelivery = async (id) => {
  await api.delete(`/routes/deliveries/${id}`);
};

export const optimizeRoutePlan = async (payload) => {
  const response = await api.post("/routes/optimize-route", payload);
  return response.data;
};

export const fetchAiInsights = async (routePlan, context = {}) => {
  const response = await api.post("/ai/route-insights", { routePlan, context });
  return response.data;
};

export default api;
