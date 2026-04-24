const axios = require('axios');
const locationCoords = require('./locationCoords');

const DEFAULT_COUNTRY = process.env.GEOCODE_COUNTRY || 'India';
const DEFAULT_VIEWBOX = process.env.GEOCODE_VIEWBOX || '76.7,28.3,77.7,29.1'; // Delhi NCR-ish: left,bottom,right,top
const USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'SmartFare/1.0 (smartfare.local)';

function normalizeCoord(coord) {
  if (!coord) return null;
  const lat = Number(coord.lat);
  const lng = Number(coord.lng ?? coord.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function getKnownLocation(name) {
  const clean = String(name || '').trim();
  if (!clean) return null;

  if (locationCoords[clean]) {
    return {
      name: clean,
      displayName: clean,
      lat: locationCoords[clean].lat,
      lng: locationCoords[clean].lng,
      source: 'local'
    };
  }

  const key = Object.keys(locationCoords).find(k => k.toLowerCase() === clean.toLowerCase());
  if (!key) return null;

  return {
    name: key,
    displayName: key,
    lat: locationCoords[key].lat,
    lng: locationCoords[key].lng,
    source: 'local'
  };
}

function localSearch(query, limit = 6) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];

  return Object.keys(locationCoords)
    .filter(name => name.toLowerCase().includes(q))
    .slice(0, limit)
    .map(name => ({
      name,
      displayName: name,
      lat: locationCoords[name].lat,
      lng: locationCoords[name].lng,
      source: 'local'
    }));
}

async function searchNominatim(query, limit = 6) {
  const clean = String(query || '').trim();
  if (clean.length < 3) return [];

  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    timeout: 9000,
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en'
    },
    params: {
      q: `${clean}, ${DEFAULT_COUNTRY}`,
      format: 'jsonv2',
      addressdetails: 1,
      limit,
      countrycodes: 'in',
      bounded: 0,
      viewbox: DEFAULT_VIEWBOX
    }
  });

  return (response.data || [])
    .map(item => {
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const address = item.address || {};
      const name = item.name || address.suburb || address.neighbourhood || address.city || clean;
      return {
        name,
        displayName: item.display_name,
        lat,
        lng,
        source: 'nominatim'
      };
    })
    .filter(Boolean);
}

async function searchLocations(query, limit = 8) {
  const local = localSearch(query, Math.min(limit, 6));
  let remote = [];

  try {
    remote = await searchNominatim(query, limit);
  } catch (error) {
    remote = [];
  }

  const seen = new Set();
  return [...local, ...remote]
    .filter(item => {
      const key = `${Number(item.lat).toFixed(5)},${Number(item.lng).toFixed(5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

async function resolveLocation(input) {
  if (typeof input === 'object' && input !== null) {
    const coords = normalizeCoord(input);
    if (coords) {
      return {
        name: input.name || input.displayName || 'Selected Location',
        displayName: input.displayName || input.name || 'Selected Location',
        ...coords,
        source: input.source || 'coords'
      };
    }
  }

  const text = String(input || '').trim();
  if (!text) throw new Error('Location is required');

  const known = getKnownLocation(text);
  if (known) return known;

  const matches = await searchNominatim(text, 1);
  if (matches[0]) return matches[0];

  throw new Error(`Location not found: ${text}`);
}

module.exports = {
  searchLocations,
  resolveLocation,
  getKnownLocation,
  normalizeCoord
};
