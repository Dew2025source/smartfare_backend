// Fare calculation logic for SmartFare

const SERVICE_PRICING = {
  Ola: {
    Bike: { base: 28, perKm: 7.5, minimum: 45, eta: "3-5 min" },
    Mini: { base: 55, perKm: 12, minimum: 95, eta: "5-8 min" },
    Sedan: { base: 80, perKm: 15.5, minimum: 140, eta: "6-10 min" },
  },
  Uber: {
    Bike: { base: 30, perKm: 8, minimum: 50, eta: "3-5 min" },
    Mini: { base: 58, perKm: 12.5, minimum: 100, eta: "5-8 min" },
    Sedan: { base: 85, perKm: 16.5, minimum: 150, eta: "6-10 min" },
  },
  Rapido: {
    "Bike Lite": { base: 22, perKm: 6.5, minimum: 35, eta: "2-4 min" },
    Bike: { base: 25, perKm: 7, minimum: 40, eta: "2-4 min" },
  },
};

const SERVICE_META = {
  Ola: { icon: "🟢", color: "success", appUrl: "https://www.olacabs.com/" },
  Uber: { icon: "⬛", color: "dark", appUrl: "https://m.uber.com/" },
  Rapido: { icon: "🟡", color: "warning", appUrl: "https://rapido.bike/" },
};

const RIDE_FEATURES = {
  Ola: {
    Bike: ["2-wheeler", "Fast", "Budget"],
    Mini: ["AC", "4-seater", "Hatchback"],
    Sedan: ["AC", "4-seater", "Premium"],
  },
  Uber: {
    Bike: ["2-wheeler", "Quick pickup", "Affordable"],
    Mini: ["AC", "4-seater", "Reliable"],
    Sedan: ["AC", "4-seater", "Comfort"],
  },
  Rapido: {
    "Bike Lite": ["2-wheeler", "Economy", "Fastest"],
    Bike: ["2-wheeler", "Standard", "Quick"],
  },
};

function getDemandMultiplier(distance) {
  if (distance <= 3) return 1;
  if (distance <= 8) return 1.04;
  if (distance <= 15) return 1.08;
  if (distance <= 25) return 1.12;
  return 1.18;
}

function calculateRidePrice(distance, config) {
  const fareBeforeDemand = config.base + distance * config.perKm;
  const withDemand = fareBeforeDemand * getDemandMultiplier(distance);
  return Math.max(Math.round(withDemand), config.minimum);
}

function calculateFares(distance) {
  const tripDistance = Number(distance);
  if (!Number.isFinite(tripDistance) || tripDistance <= 0) {
    return [];
  }

  const fares = [];

  for (const [service, rideTypes] of Object.entries(SERVICE_PRICING)) {
    const meta = SERVICE_META[service];

    for (const [rideType, config] of Object.entries(rideTypes)) {
      fares.push({
        service,
        rideType,
        price: calculateRidePrice(tripDistance, config),
        distance: Number(tripDistance.toFixed(1)),
        icon: meta.icon,
        color: meta.color,
        appUrl: meta.appUrl,
        eta: config.eta,
        features: RIDE_FEATURES[service]?.[rideType] || [],
      });
    }
  }

  return fares.sort((a, b) => a.price - b.price);
}

function getCheapestFare(fares) {
  if (!fares.length) return null;
  return fares.reduce((min, fare) => (fare.price < min.price ? fare : min), fares[0]);
}

module.exports = {
  calculateFares,
  getCheapestFare,
};
