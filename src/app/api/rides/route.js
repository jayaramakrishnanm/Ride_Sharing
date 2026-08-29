import fs from 'fs';
import path from 'path';

const ridesFilePath = path.join(process.cwd(), 'src', 'data', 'rides.json');

function readRidesFromFile() {
  try {
    if (!fs.existsSync(ridesFilePath)) {
      return [];
    }
    const data = fs.readFileSync(ridesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rides.json:', error);
    return [];
  }
}

function writeRidesToFile(rides) {
  try {
    const dir = path.dirname(ridesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ridesFilePath, JSON.stringify(rides, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing rides.json:', error);
    return false;
  }
}

function generateNextRideId(rides) {
  const nums = rides.map((r) => {
    const n = parseInt(String(r.id).replace(/\D/g, ''), 10);
    return isNaN(n) ? 0 : n;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 100;
  return `R${max + 1}`;
}

/**
 * GET /api/rides
 * Returns all rides or filtered by query params
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');

    let rides = readRidesFromFile();

    if (userId) {
      rides = rides.filter((r) => r.userId === userId);
    }
    if (driverId) {
      rides = rides.filter((r) => r.driverId === driverId);
    }
    if (status) {
      rides = rides.filter((r) => r.status === status);
    }

    return Response.json({ success: true, rides });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to read rides.' }, { status: 500 });
  }
}

/**
 * POST /api/rides
 * Create and persist a new ride to src/data/rides.json
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const rides = readRidesFromFile();

    const newId = body.id || generateNextRideId(rides);
    const nowIso = new Date().toISOString();
    const nowDate = nowIso.split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRide = {
      id: newId,
      userId: body.userId || 'U101',
      userName: body.userName || 'Passenger',
      userPhone: body.userPhone || '9876543210',
      driverId: body.driverId || null,
      driverName: body.driverName || null,
      driverPhone: body.driverPhone || null,
      pickup: body.pickup || 'Chennai Central',
      drop: body.drop || 'T Nagar',
      vehicleType: body.vehicleType || 'Car',
      vehicleModel: body.vehicleModel || null,
      vehicleNumber: body.vehicleNumber || null,
      distanceKm: Number(body.distanceKm) || 5.0,
      fare: Number(body.fare) || 120,
      baseFare: Number(body.baseFare) || (body.vehicleType === 'Bike' ? 30 : 50),
      distanceFare: Number(body.distanceFare) || 70,
      date: body.date || nowDate,
      time: body.time || nowTime,
      passengers: Number(body.passengers) || 1,
      status: body.status || 'Pending',
      paymentMethod: body.paymentMethod || 'UPI',
      paymentStatus: body.paymentStatus || 'Pending',
      otp: body.otp || String(Math.floor(1000 + Math.random() * 9000)),
      rating: body.rating || null,
      feedback: body.feedback || null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    rides.unshift(newRide);
    writeRidesToFile(rides);

    return Response.json({ success: true, ride: newRide });
  } catch (error) {
    console.error('Error creating ride:', error);
    return Response.json({ success: false, error: 'Failed to create ride.' }, { status: 500 });
  }
}

/**
 * PUT /api/rides
 * Update ride status / rating / details and save to src/data/rides.json
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ success: false, error: 'Ride ID is required.' }, { status: 400 });
    }

    const rides = readRidesFromFile();
    const index = rides.findIndex((r) => r.id === id);

    if (index === -1) {
      return Response.json({ success: false, error: 'Ride not found.' }, { status: 404 });
    }

    rides[index] = {
      ...rides[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeRidesToFile(rides);

    return Response.json({ success: true, ride: rides[index] });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to update ride.' }, { status: 500 });
  }
}
