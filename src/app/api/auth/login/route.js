import fs from 'fs';
import path from 'path';
import { getIndiaTimestamp } from '@/lib/dateUtils';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

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
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users.json:', error);
    return false;
  }
}

/**
 * POST /api/auth/login
 * Validates credentials against src/data/users.json
 * Updates ONLY the successfully authenticated account's `lastLogin` with Asia/Kolkata (+05:30) timestamp
 * Leaves `joinedDate` and all other accounts completely unchanged
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, error: 'Email/Phone and Password are required.' },
        { status: 400 }
      );
    }

    const accounts = readUsersFromFile();
    const cleanIdentifier = email.trim().toLowerCase();

    // Find account by email or phone
    const index = accounts.findIndex(
      (a) =>
        (a.email || '').toLowerCase() === cleanIdentifier ||
        (a.phone && a.phone.trim() === email.trim())
    );

    if (index === -1) {
      return Response.json(
        { success: false, error: 'Account not found with this email or phone.' },
        { status: 404 }
      );
    }

    const account = accounts[index];

    // Password verification (Failed login must NOT update lastLogin)
    if (account.password && account.password !== password) {
      return Response.json(
        { success: false, error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // Role check if specified
    if (role) {
      const userRole = (account.role || '').toLowerCase();
      const reqRole = role.toLowerCase();

      if (
        userRole !== reqRole &&
        !(reqRole === 'user' && (userRole === 'passenger' || userRole === 'admin')) &&
        !(reqRole === 'driver' && userRole === 'driver') &&
        !(reqRole === 'admin' && userRole === 'admin')
      ) {
        return Response.json(
          {
            success: false,
            error: `Account found but role is "${account.role}". Please select the ${account.role.toUpperCase()} tab.`
          },
          { status: 403 }
        );
      }
    }

    // Status check (Inactive accounts cannot login and lastLogin is NOT updated)
    if (account.status === 'Inactive') {
      return Response.json(
        {
          success: false,
          error: `Your ${account.role} account has been deactivated. Please contact support.`
        },
        { status: 403 }
      );
    }

    // SUCCESSFUL LOGIN: Generate India Timestamp (Asia/Kolkata +05:30)
    const istTimestamp = getIndiaTimestamp();

    // Update ONLY this account's lastLogin field
    accounts[index] = {
      ...accounts[index],
      lastLogin: istTimestamp
    };

    // Save back to single source of truth (users.json)
    writeUsersToFile(accounts);

    return Response.json({
      success: true,
      message: 'Login successful',
      user: accounts[index]
    });
  } catch (error) {
    console.error('Login API error:', error);
    return Response.json(
      { success: false, error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
