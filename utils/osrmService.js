const axios = require("axios");

async function getRoadDetails(fromCoords, toCoords) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=geojson&steps=false`;

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

  const route = response.data.routes[0];
  return {
    distance: Number((route.distance / 1000).toFixed(1)),
    durationMinutes: Number((route.duration / 60).toFixed(0)),
    geometry: route.geometry || null
  };
}

async function getRoadDistanceKm(fromCoords, toCoords) {
  const details = await getRoadDetails(fromCoords, toCoords);
  return details.distance;
}

module.exports = { getRoadDistanceKm, getRoadDetails };
