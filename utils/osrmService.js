const axios = require("axios");

async function getRoadDistanceKm(fromCoords, toCoords) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=false`;

  const response = await axios.get(url, {
    timeout: 10000
  });

  if (
    !response.data ||
    response.data.code !== "Ok" ||
    !response.data.routes ||
    !response.data.routes.length
  ) {
    throw new Error("No valid route found from OSRM");
  }

  const meters = response.data.routes[0].distance;
  return Number((meters / 1000).toFixed(1));
}

module.exports = { getRoadDistanceKm };