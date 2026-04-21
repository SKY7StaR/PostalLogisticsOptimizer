import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
} from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const speedMap = {
  car: 2000,
  truck: 3000,
  bus: 2500,
  flight: 800,
  bike: 2200,
  van: 1800,
};

const routeColors = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444"];

const interpolatePoint = (points, progress) => {
  if (points.length === 1) {
    return points[0];
  }

  const segmentProgress = progress * (points.length - 1);
  const segmentIndex = Math.min(
    Math.floor(segmentProgress),
    points.length - 2
  );
  const localProgress = segmentProgress - segmentIndex;
  const [startLat, startLng] = points[segmentIndex];
  const [endLat, endLng] = points[segmentIndex + 1];

  return [
    startLat + (endLat - startLat) * localProgress,
    startLng + (endLng - startLng) * localProgress,
  ];
};

const MapView = ({ locations, mode, routeOptions = [], selectedRouteId }) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  const fallbackPositions = locations.map((location) => [location.lat, location.lng]);
  const activeRoute =
    routeOptions.find((option) => option.id === selectedRouteId) || routeOptions[0];
  const activePositions =
    activeRoute?.checkpoints?.map((checkpoint) => [checkpoint.lat, checkpoint.lng]) ||
    fallbackPositions;

  useEffect(() => {
    setAnimationProgress(0);

    if (activePositions.length < 2) {
      return undefined;
    }

    const interval = setInterval(() => {
      setAnimationProgress((previous) => (previous >= 1 ? 0 : previous + 0.04));
    }, Math.max(speedMap[mode] / 20, 100));

    return () => clearInterval(interval);
  }, [mode, activePositions.length, selectedRouteId]);

  const animatedDots = useMemo(() => {
    if (activePositions.length < 2) {
      return [];
    }

    return [0, 0.18, 0.36, 0.54].map((offset) =>
      interpolatePoint(activePositions, (animationProgress + offset) % 1)
    );
  }, [activePositions, animationProgress]);

  return (
    <MapContainer
      center={activePositions[0] || [20.5937, 78.9629]}
      zoom={activePositions.length > 0 ? 6 : 4}
      style={{ height: "440px", width: "100%", borderRadius: "16px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {routeOptions.length > 0
        ? routeOptions.map((option, index) => {
            const optionPositions = option.checkpoints.map((checkpoint) => [
              checkpoint.lat,
              checkpoint.lng,
            ]);
            const isActive = option.id === activeRoute?.id;

            return (
              <Polyline
                key={option.id}
                positions={optionPositions}
                pathOptions={{
                  color: routeColors[index % routeColors.length],
                  weight: isActive ? 6 : 3,
                  opacity: isActive ? 0.9 : 0.42,
                  dashArray: isActive ? null : "10 10",
                }}
              />
            );
          })
        : activePositions.length > 1 && <Polyline positions={activePositions} />}

      {(activeRoute?.checkpoints || locations).map((location, index) => {
        const markerLat = location.lat;
        const markerLng = location.lng;

        return (
          <Marker key={`${location.name || location.destination}-${index}`} position={[markerLat, markerLng]}>
            <Popup>
              <strong>{index === 0 ? "Origin" : `Point ${index}`}</strong>
              <br />
              {location.name || location.destination || "Route checkpoint"}
            </Popup>
          </Marker>
        );
      })}

      {animatedDots.map((dot, index) => (
        <CircleMarker
          key={`animated-dot-${index}`}
          center={dot}
          radius={index === 0 ? 7 : 5}
          pathOptions={{
            color: "#ffffff",
            fillColor: routeColors[index % routeColors.length],
            fillOpacity: 0.9,
            weight: 2,
          }}
        />
      ))}
    </MapContainer>
  );
};

export default MapView;
