const { findFixedRoute } = require("./routeData");

function findFixedDistance(from, to) {
  const fixedRoute = findFixedRoute(from, to);
  return fixedRoute ? fixedRoute.distance : null;
}

module.exports = { findFixedDistance };
