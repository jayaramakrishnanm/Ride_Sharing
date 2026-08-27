// =========================================================
// Simulated Geo-Based Driver Matching System (JavaScript ES6)
// =========================================================

// Sample GPS coordinates for metro landmarks
export const LOCATION_COORDINATES = {
  'Chennai Central': { lat: 13.0827, lng: 80.2707 },
  'T Nagar': { lat: 13.0418, lng: 80.2341 },
  'Guindy Metro': { lat: 13.0067, lng: 80.2030 },
  'Chennai Airport': { lat: 12.9941, lng: 80.1709 },
  'Velachery Phoenix Mall': { lat: 12.9830, lng: 80.2181 },
  'Anna Nagar Roundtana': { lat: 13.0850, lng: 80.2101 },
  'Marina Beach': { lat: 13.0500, lng: 80.2824 },
  'OMR Tech Park': { lat: 12.9667, lng: 80.2450 },
  'Porur Junction': { lat: 13.0382, lng: 80.1565 },
  'Tambaram Sanatorium': { lat: 12.9249, lng: 80.1332 },
  'Koyambedu Bus Terminus': { lat: 13.0694, lng: 80.1948 },
  'Adyar Signal': { lat: 13.0012, lng: 80.2565 },
  'Mylapore Temple': { lat: 13.0336, lng: 80.2687 },
  'Egmore Railway Station': { lat: 13.0797, lng: 80.2608 },
  'Nungambakkam High Road': { lat: 13.0569, lng: 80.2425 }
};

// Driver sample simulated coordinates
const DRIVER_LOCATIONS = {
  'D101': { lat: 13.0878, lng: 80.2785 }, // Near Central
  'D102': { lat: 13.0450, lng: 80.2390 }, // Near T Nagar
  'D103': { lat: 13.0100, lng: 80.2080 }, // Near Guindy
  'D104': { lat: 12.9890, lng: 80.2210 }, // Near Velachery
  'D105': { lat: 13.0890, lng: 80.2150 }, // Near Anna Nagar
  'D106': { lat: 12.9700, lng: 80.2490 }, // Near OMR
  'D107': { lat: 12.9980, lng: 80.1750 }, // Near Airport
  'D108': { lat: 13.0550, lng: 80.2860 }, // Near Marina
  'D109': { lat: 12.9300, lng: 80.1380 }, // Near Tambaram
  'D110': { lat: 13.0730, lng: 80.1980 }  // Near Koyambedu
};

/**
 * Calculates straight line approximate distance between two GPS coordinates using Haversine formula
 */
export function calculateGeoDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Matches and sorts nearby available drivers based on passenger pickup location and vehicle type
 */
export function getNearbyAvailableDrivers(pickupLocation, vehicleType, allDrivers = []) {
  const passengerCoords = LOCATION_COORDINATES[pickupLocation] || { lat: 13.0827, lng: 80.2707 };

  const matched = allDrivers
    .filter((d) => d.status === 'Active' && (!vehicleType || d.vehicleType === vehicleType))
    .map((driver) => {
      const driverCoords = DRIVER_LOCATIONS[driver.id] || {
        lat: passengerCoords.lat + (Math.random() * 0.03 - 0.015),
        lng: passengerCoords.lng + (Math.random() * 0.03 - 0.015)
      };

      const distanceAwayKm = calculateGeoDistance(
        passengerCoords.lat,
        passengerCoords.lng,
        driverCoords.lat,
        driverCoords.lng
      );

      return {
        ...driver,
        coordinates: driverCoords,
        distanceAwayKm: Math.max(0.5, distanceAwayKm),
        estimatedArrivalMins: Math.max(2, Math.round(distanceAwayKm * 2.5) + 1)
      };
    })
    .sort((a, b) => a.distanceAwayKm - b.distanceAwayKm);

  return matched;
}
