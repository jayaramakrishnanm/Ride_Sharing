import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

/**
 * Helper to read users from JSON file
 */
function readUsersFromFile() {
  try {
    if (!fs.existsSync(usersFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading users.json:', error);
    return [];
  }
}

function writeUsersToFile(users) {
  try {
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users.json:', error);
    return false;
  }
}

/**
 * Generate next unique ID based on role
 */
function generateNextId(accounts, role) {
  if (role === 'driver') {
    const driverIds = accounts
      .filter((a) => a.role === 'driver' && typeof a.id === 'string' && a.id.startsWith('D'))
      .map((a) => {
        const num = parseInt(a.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      });

    const maxId = driverIds.length > 0 ? Math.max(...driverIds) : 100;
    return `D${maxId + 1}`;
  } else {
    const userIds = accounts
      .filter((a) => (a.role === 'user' || a.role === 'passenger') && typeof a.id === 'string' && a.id.startsWith('U'))
      .map((a) => {
        const num = parseInt(a.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      });

    const maxId = userIds.length > 0 ? Math.max(...userIds) : 100;
    return `U${maxId + 1}`;
  }
}

/**
 * GET /api/users
 * Returns all accounts from src/data/users.json
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const accounts = readUsersFromFile();

    if (role) {
      const filtered = accounts.filter((a) => a.role === role);
      return Response.json({ success: true, users: filtered });
    }

    return Response.json({ success: true, users: accounts });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to retrieve accounts.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Registers a new USER or DRIVER and appends to src/data/users.json
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      role = 'user',
      emergencyContact = '',
      status = 'Active',
      // Driver-specific fields
      vehicleType,
      vehicleModel,
      vehicleNumber,
      vehicleColor = 'Standard',
      licenseNumber = 'DL-PENDING',
      drivingExperience = 1,
      currentLocation = 'Chennai Central'
    } = body;

    // 1. Basic validation
    if (!name || !name.trim()) {
      return Response.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return Response.json({ success: false, error: 'Valid email address is required.' }, { status: 400 });
    }
    if (!phone || !phone.trim() || phone.trim().length < 10) {
      return Response.json({ success: false, error: 'Valid 10-digit phone number is required.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return Response.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Role Security: Client cannot create admin accounts directly
    const targetRole = role === 'driver' ? 'driver' : 'user';

    if (targetRole === 'driver') {
      if (!vehicleModel || !vehicleModel.trim() || !vehicleNumber || !vehicleNumber.trim()) {
        return Response.json(
          { success: false, error: 'Vehicle model and plate number are required for driver registration.' },
          { status: 400 }
        );
      }
    }

    const accounts = readUsersFromFile();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // 2. Duplicate Email Check
    if (accounts.some((a) => (a.email || '').toLowerCase() === cleanEmail)) {
      return Response.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // 3. Duplicate Phone Check
    if (accounts.some((a) => (a.phone || '').trim() === cleanPhone)) {
      return Response.json(
        { success: false, error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // 4. Generate unique ID
    const newId = generateNextId(accounts, targetRole);
    const now = new Date().toISOString().split('T')[0];

    // 5. Construct Account Object (joinedDate = registration date, lastLogin = null)
    let newAccount;
    if (targetRole === 'driver') {
      newAccount = {
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: password,
        role: 'driver',
        avatar: '',
        rating: 5.0,
        totalRides: 0,
        completedToday: 0,
        earningsToday: 0,
        totalEarnings: 0,
        joinedDate: now,
        lastLogin: null,
        emergencyContact: emergencyContact || '',
        status: status || 'Active',
        licenseNumber: licenseNumber.trim().toUpperCase(),
        vehicleType: vehicleType || 'Car',
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleModel: vehicleModel.trim(),
        vehicleColor: vehicleColor || 'Standard',
        drivingExperience: Number(drivingExperience) || 1,
        available: true,
        currentLocation: currentLocation || 'Chennai Central'
      };
    } else {
      newAccount = {
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: password,
        role: 'user',
        avatar: '',
        rating: 5.0,
        totalRides: 0,
        joinedDate: now,
        lastLogin: null,
        emergencyContact: emergencyContact || '',
        status: status || 'Active'
      };
    }

    // 6. Append and persist to users.json
    accounts.push(newAccount);
    const writeOk = writeUsersToFile(accounts);

    if (!writeOk) {
      return Response.json(
        { success: false, error: 'Failed to save account.' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: `${targetRole === 'driver' ? 'Driver' : 'User'} registered successfully.`,
      user: newAccount
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return Response.json(
      { success: false, error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users
 * Update user/driver profile by ID
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ success: false, error: 'Account ID is required.' }, { status: 400 });
    }

    const accounts = readUsersFromFile();
    const index = accounts.findIndex((a) => a.id === id);

    if (index === -1) {
      return Response.json({ success: false, error: 'Account not found.' }, { status: 404 });
    }

    // Check email uniqueness if email is changed
    if (updates.email && updates.email.toLowerCase() !== accounts[index].email.toLowerCase()) {
      const emailExists = accounts.some(
        (a) => a.id !== id && (a.email || '').toLowerCase() === updates.email.toLowerCase()
      );
      if (emailExists) {
        return Response.json({ success: false, error: 'Email already registered' }, { status: 400 });
      }
    }

    // Check phone uniqueness if phone is changed
    if (updates.phone && updates.phone.trim() !== accounts[index].phone.trim()) {
      const phoneExists = accounts.some(
        (a) => a.id !== id && (a.phone || '').trim() === updates.phone.trim()
      );
      if (phoneExists) {
        return Response.json({ success: false, error: 'Phone number already registered' }, { status: 400 });
      }
    }

    // Protect joinedDate from inadvertent overwrite
    const preservedJoinedDate = accounts[index].joinedDate;
    accounts[index] = {
      ...accounts[index],
      ...updates,
      joinedDate: preservedJoinedDate
    };

    writeUsersToFile(accounts);

    return Response.json({ success: true, user: accounts[index] });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to update account.' }, { status: 500 });
  }
}

/**
 * DELETE /api/users
 * Delete user/driver by ID
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ success: false, error: 'Account ID is required.' }, { status: 400 });
    }

    let accounts = readUsersFromFile();
    const initialLen = accounts.length;
    accounts = accounts.filter((a) => a.id !== id);

    if (accounts.length === initialLen) {
      return Response.json({ success: false, error: 'Account not found.' }, { status: 404 });
    }

    writeUsersToFile(accounts);
    return Response.json({ success: true, message: 'Account deleted.' });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to delete account.' }, { status: 500 });
  }
}
