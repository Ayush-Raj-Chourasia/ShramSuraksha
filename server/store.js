import mongoose from 'mongoose';
import { Worker, Policy, Claim, Alert } from './models.js';

let dbConnected = false;

export async function connectDB() {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.MONGO_DB_NAME || 'shramsuraksha';
  if (!mongoUrl) {
    console.log('⚠️  MONGO_URL not set — run with MONGO_URL env var');
    return false;
  }
  try {
    await mongoose.connect(mongoUrl, { dbName });
    dbConnected = true;
    console.log('✅ MongoDB connected:', dbName);
    await seedDB();
    return true;
  } catch (err) {
    console.error('❌ MongoDB failed:', err.message);
    return false;
  }
}

async function seedDB() {
  const count = await Worker.countDocuments();
  if (count > 0) { console.log('📦 DB has', count, 'workers — skipping seed'); return; }
  console.log('🌱 Seeding demo data...');

  const rahul = await Worker.create({
    name: 'Rahul Sharma', phone: '9876543210', platform: 'zomato',
    city: 'Mumbai', zone: '4B', gpsLat: 19.076, gpsLng: 72.8777, riskScore: 35,
  });

  await Worker.create({
    name: 'Priya Patel', phone: '9876543211', platform: 'swiggy',
    city: 'Delhi', zone: '2A', gpsLat: 28.6139, gpsLng: 77.209, riskScore: 20,
  });

  const policy = await Policy.create({
    userId: rahul._id.toString(), plan: 'standard',
    weeklyPremium: 59, dailyCoverage: 850, weeklyCoverage: 5950,
    startDate: new Date(Date.now() - 7 * 86400000),
    endDate: new Date(Date.now() + 7 * 86400000),
  });

  await Claim.create({
    userId: rahul._id.toString(), policyId: policy._id.toString(),
    triggerType: 'heavy_rainfall', status: 'settled',
    triggerData: { value: 34, threshold: 30, unit: 'mm/hr', source: 'IMD' },
    location: { lat: 19.076, lng: 72.8777, zone: '4B', area: 'Andheri' },
    payoutAmount: 480, settleTime: 87, fraudScore: 0,
    paymentRef: 'UPI-REF-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    userName: 'Rahul Sharma', userPlatform: 'zomato',
  });

  await Claim.create({
    userId: rahul._id.toString(), policyId: policy._id.toString(),
    triggerType: 'severe_aqi', status: 'settled',
    triggerData: { value: 280, threshold: 200, unit: 'AQI', source: 'CPCB' },
    location: { lat: 19.076, lng: 72.8777, zone: '4B', area: 'Andheri' },
    payoutAmount: 200, settleTime: 62, fraudScore: 0,
    paymentRef: 'UPI-REF-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    userName: 'Rahul Sharma', userPlatform: 'zomato',
  });

  await Alert.create([
    { type: 'heavy_rainfall', title: 'Heavy Rainfall Warning', description: '34mm/hr expected 2–5 PM in Zone 4B', zone: '4B', city: 'Mumbai', payoutTriggered: true, payoutAmount: 480, workersAffected: 12 },
    { type: 'severe_aqi', title: 'AQI Severe Alert', description: 'AQI crossed 280 in Andheri', zone: '4B', city: 'Mumbai', payoutTriggered: true, payoutAmount: 200, workersAffected: 8 },
    { type: 'extreme_heat', title: 'IMD Alert: Extreme Heat', description: 'IMD detected extreme heat', zone: '4B', city: 'Mumbai', payoutTriggered: false, workersAffected: 5 },
  ]);

  console.log('✅ Demo data seeded');
}

export function generateId(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 15) + Date.now().toString(36);
}
