const locationCoords = require("./locationCoords");
const { getRoadDistanceKm } = require("./osrmService");
const { findFixedRoute } = require("./routeData");

async function getDistance(from, to) {
  const fromName = String(from || "").trim();
  const toName = String(to || "").trim();

  if (!fromName || !toName) {
    throw new Error("Both pickup and drop-off are required");
  }

  const fromCoords = locationCoords[fromName];
  const toCoords = locationCoords[toName];

  if (fromCoords && toCoords) {
    try {
      const distance = await getRoadDistanceKm(fromCoords, toCoords);
      return {
        distance,
        source: "osrm",
      };
    } catch (error) {
      const fixedRoute = findFixedRoute(fromName, toName);
      if (fixedRoute) {
        return {
          distance: fixedRoute.distance,
          source: "fixed",
        };
      }

      throw new Error(`Unable to calculate route distance for ${fromName} to ${toName}`);
    }
  }

  const fixedRoute = findFixedRoute(fromName, toName);
  if (fixedRoute) {
    return {
      distance: fixedRoute.distance,
      source: "fixed",
    };
  }

  throw new Error(`Route not found for ${fromName} to ${toName}`);
}

module.exports = { getDistance };
