import fs from 'fs';
import path from 'path';

const notifsFilePath = path.join(process.cwd(), 'src', 'data', 'notifications.json');

function readNotifsFromFile() {
  try {
    if (!fs.existsSync(notifsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(notifsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading notifications.json:', error);
    return [];
  }
}

function writeNotifsToFile(notifs) {
  try {
    const dir = path.dirname(notifsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(notifsFilePath, JSON.stringify(notifs, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing notifications.json:', error);
    return false;
  }
}

function generateNextNotifId(notifs) {
  const nums = notifs.map((n) => {
    const num = parseInt(String(n.id).replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 100;
  return `N${max + 1}`;
}

/**
 * GET /api/notifications
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');

    let notifs = readNotifsFromFile();

    if (recipientId) {
      notifs = notifs.filter((n) => n.recipientId === recipientId || n.recipientId === 'ALL');
    }

    return Response.json({ success: true, notifications: notifs });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to read notifications.' }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const notifs = readNotifsFromFile();

    const newNotif = {
      id: body.id || generateNextNotifId(notifs),
      recipientId: body.recipientId || 'U101',
      recipientRole: body.recipientRole || 'user',
      title: body.title || 'New Notification',
      message: body.message || '',
      rideId: body.rideId || null,
      type: body.type || 'info',
      read: false,
      createdAt: new Date().toISOString()
    };

    notifs.unshift(newNotif);
    writeNotifsToFile(notifs);

    return Response.json({ success: true, notification: newNotif });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ success: false, error: 'Failed to create notification.' }, { status: 500 });
  }
}

/**
 * PUT /api/notifications
 * Mark as read
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, recipientId, markAll } = body;
    const notifs = readNotifsFromFile();

    if (markAll && recipientId) {
      notifs.forEach((n) => {
        if (n.recipientId === recipientId || n.recipientId === 'ALL') {
          n.read = true;
        }
      });
    } else if (id) {
      const target = notifs.find((n) => n.id === id);
      if (target) target.read = true;
    }

    writeNotifsToFile(notifs);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to update notifications.' }, { status: 500 });
  }
}
