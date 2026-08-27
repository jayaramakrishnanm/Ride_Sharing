// =========================================================
// Fare Calculator & Metro Location Engine (JavaScript ES6)
// =========================================================

export const METRO_LOCATIONS = [
  'Chennai Central',
  'T Nagar',
  'Guindy Metro',
  'Chennai Airport',
  'Velachery Phoenix Mall',
  'Anna Nagar Roundtana',
  'Marina Beach',
  'OMR Tech Park',
  'Porur Junction',
  'Tambaram Sanatorium',
  'Koyambedu Bus Terminus',
  'Adyar Signal',
  'Mylapore Temple',
  'Egmore Railway Station',
  'Nungambakkam High Road',
  'Besant Nagar Beach',
  'Ashok Nagar Metro',
  'Thiruvanmiyur ECR'
];

// Distance matrix between locations in km
const DISTANCE_MATRIX = {
  'Chennai Central': {
    'T Nagar': 8.5,
    'Guindy Metro': 12.0,
    'Chennai Airport': 18.2,
    'Velachery Phoenix Mall': 15.4,
    'Anna Nagar Roundtana': 7.8,
    'Marina Beach': 4.2,
    'OMR Tech Park': 20.5,
    'Porur Junction': 16.0,
    'Tambaram Sanatorium': 26.0,
    'Koyambedu Bus Terminus': 9.2,
    'Adyar Signal': 11.5,
    'Mylapore Temple': 6.8,
    'Egmore Railway Station': 2.5,
    'Nungambakkam High Road': 5.5,
    'Besant Nagar Beach': 13.0,
    'Ashok Nagar Metro': 10.5,
    'Thiruvanmiyur ECR': 14.5
  },
  'T Nagar': {
    'Chennai Central': 8.5,
    'Guindy Metro': 4.8,
    'Chennai Airport': 11.2,
    'Velachery Phoenix Mall': 8.0,
    'Anna Nagar Roundtana': 8.2,
    'Marina Beach': 7.0,
    'OMR Tech Park': 14.0,
    'Porur Junction': 9.5,
    'Tambaram Sanatorium': 18.5,
    'Koyambedu Bus Terminus': 7.2,
    'Adyar Signal': 6.0,
    'Mylapore Temple': 4.5,
    'Egmore Railway Station': 6.5,
    'Nungambakkam High Road': 3.2,
    'Besant Nagar Beach': 7.8,
    'Ashok Nagar Metro': 3.0,
    'Thiruvanmiyur ECR': 9.2
  },
  'Chennai Airport': {
    'Chennai Central': 18.2,
    'T Nagar': 11.2,
    'Guindy Metro': 6.5,
    'Velachery Phoenix Mall': 9.8,
    'Anna Nagar Roundtana': 16.5,
    'Marina Beach': 17.0,
    'OMR Tech Park': 15.2,
    'Porur Junction': 10.0,
    'Tambaram Sanatorium': 8.5,
    'Koyambedu Bus Terminus': 14.0,
    'Adyar Signal': 12.0,
    'Mylapore Temple': 14.2,
    'Egmore Railway Station': 16.0,
    'Nungambakkam High Road': 13.5,
    'Besant Nagar Beach': 14.0,
    'Ashok Nagar Metro': 9.0,
    'Thiruvanmiyur ECR': 13.8
  },
  'OMR Tech Park': {
    'Chennai Central': 20.5,
    'T Nagar': 14.0,
    'Guindy Metro': 11.0,
    'Chennai Airport': 15.2,
    'Velachery Phoenix Mall': 7.5,
    'Anna Nagar Roundtana': 22.0,
    'Marina Beach': 16.5,
    'Porur Junction': 18.0,
    'Tambaram Sanatorium': 16.0,
    'Koyambedu Bus Terminus': 21.0,
    'Adyar Signal': 8.5,
    'Mylapore Temple': 13.0,
    'Egmore Railway Station': 19.0,
    'Nungambakkam High Road': 16.0,
    'Besant Nagar Beach': 10.2,
    'Ashok Nagar Metro': 14.5,
    'Thiruvanmiyur ECR': 7.0
  }
};

/**
 * Calculates estimated distance in km
 */
export function getEstimatedDistance(pickup, drop) {
  if (!pickup || !drop || pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
    return 0;
  }

  if (DISTANCE_MATRIX[pickup] && DISTANCE_MATRIX[pickup][drop]) {
    return DISTANCE_MATRIX[pickup][drop];
  }
  if (DISTANCE_MATRIX[drop] && DISTANCE_MATRIX[drop][pickup]) {
    return DISTANCE_MATRIX[drop][pickup];
  }

  let hash = 0;
  const combined = (pickup + drop).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const distance = ((positiveHash % 180) / 10) + 2.5;
  return Math.round(distance * 10) / 10;
}

/**
 * Calculates fare for Car or Bike
 * Car: Base ₹50, Per km ₹15
 * Bike: Base ₹30, Per km ₹8
 */
export function calculateFare(vehicleType, distanceKm) {
  const baseFare = vehicleType === 'Car' ? 50 : 30;
  const ratePerKm = vehicleType === 'Car' ? 15 : 8;
  const distanceFare = Math.round(distanceKm * ratePerKm);
  const totalFare = Math.max(baseFare, baseFare + distanceFare);
  
  const avgSpeed = vehicleType === 'Car' ? 25 : 30;
  const estimatedDurationMins = Math.max(5, Math.round((distanceKm / avgSpeed) * 60) + 3);

  return {
    vehicleType,
    baseFare,
    ratePerKm,
    distanceKm,
    distanceFare,
    estimatedDurationMins,
    totalFare
  };
}

export function formatCurrency(amount) {
  return `₹${(amount || 0).toLocaleString('en-IN')}`;
}

export function generateRideId() {
  const num = Math.floor(100 + Math.random() * 900);
  return `R${num}`;
}

export function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
