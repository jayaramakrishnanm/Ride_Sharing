import fs from 'fs';
import path from 'path';

const paymentsFilePath = path.join(process.cwd(), 'src', 'data', 'payments.json');

function readPaymentsFromFile() {
  try {
    if (!fs.existsSync(paymentsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(paymentsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading payments.json:', error);
    return [];
  }
}

function writePaymentsToFile(payments) {
  try {
    fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing payments.json:', error);
    return false;
  }
}

function generateNextPaymentId(payments) {
  const nums = payments.map((p) => {
    const n = parseInt(String(p.id).replace(/\D/g, ''), 10);
    return isNaN(n) ? 0 : n;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 100;
  return `PAY${max + 1}`;
}

/**
 * GET /api/payments
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const rideId = searchParams.get('rideId');

    let payments = readPaymentsFromFile();

    if (userId) payments = payments.filter((p) => p.userId === userId);
    if (rideId) payments = payments.filter((p) => p.rideId === rideId);

    return Response.json({ success: true, payments });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to read payments.' }, { status: 500 });
  }
}

/**
 * POST /api/payments
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const payments = readPaymentsFromFile();

    const newId = body.id || generateNextPaymentId(payments);
    const now = new Date();
    const nowDate = now.toISOString().split('T')[0];
    const nowTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newPayment = {
      id: newId,
      rideId: body.rideId || 'R101',
      userId: body.userId || 'U101',
      userName: body.userName || 'Passenger',
      driverId: body.driverId || null,
      driverName: body.driverName || null,
      amount: Number(body.amount) || 100,
      method: body.method || 'UPI',
      status: body.status || 'Success',
      transactionId: body.transactionId || `TXN_${(body.method || 'UPI').toUpperCase()}_${Date.now()}`,
      date: body.date || nowDate,
      time: body.time || nowTime
    };

    payments.unshift(newPayment);
    writePaymentsToFile(payments);

    return Response.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error('Error creating payment:', error);
    return Response.json({ success: false, error: 'Failed to save payment.' }, { status: 500 });
  }
}
