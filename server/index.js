import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import policyRoutes from './routes/policy.js';
import claimsRoutes from './routes/claims.js';
import twilioRoutes from './routes/twilio.js';
import weatherRoutes from './routes/weather.js';
import aiRoutes from './routes/ai.js';
import { connectDB } from './store.js';
import { Worker, Policy, Claim, ActivityLog } from './models.js';
import { startTriggerMonitor, getMonitorStatus } from './routes/trigger-monitor.js';
import { requireAdmin } from './middleware/adminAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Activity Logger middleware — logs EVERY request to DB ─────────────────
app.use(async (req, res, next) => {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.get('User-Agent') || '';

  // Skip logging static/health pings to avoid noise
  const skip = ['/api/health', '/api/stats'].includes(req.path) && req.method === 'GET';

  // Capture original json to log response status
  const originalJson = res.json.bind(res);
  let responseBody = null;
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', async () => {
    if (skip) return;
    const durationMs = Date.now() - start;
    const isError = res.statusCode >= 400;

    // Determine category from path
    const path = req.path;
    let category = 'general';
    if (path.includes('/auth')) category = 'auth';
    else if (path.includes('/claims')) category = 'claim';
    else if (path.includes('/policies')) category = 'policy';
    else if (path.includes('/weather')) category = 'weather';
    else if (path.includes('/ai')) category = 'ai';

    // Map path+method to readable action names
    const actionMap = {
      'POST /api/auth/send-otp': 'OTP_SENT',
      'POST /api/auth/verify-otp': 'OTP_VERIFIED',
      'POST /api/auth/register': 'WORKER_REGISTERED',
      'POST /api/auth/login': 'WORKER_LOGIN',
      'POST /api/claims/file': 'CLAIM_FILED',
      'POST /api/policies/activate': 'POLICY_ACTIVATED',
      'GET /api/claims/all': 'ADMIN_VIEWED_CLAIMS',
      'GET /api/auth/workers': 'ADMIN_VIEWED_WORKERS',
      'POST /api/ai/calculate-premium': 'PREMIUM_CALCULATED',
      'POST /api/ai/risk-assessment': 'RISK_ASSESSED',
      'GET /api/weather/current': 'WEATHER_FETCHED',
    };
    const key = `${req.method} ${path.replace(/\/[a-f0-9]{24}$/, '').replace(/\/[0-9]{10}$/, '')}`;
    const action = actionMap[key] || `${req.method} ${path}`;

    try {
      await ActivityLog.create({
        userId: req.body?.userId || req.params?.userId || 'anonymous',
        userName: req.body?.name || responseBody?.user?.name || '',
        action,
        category,
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          body: req.method !== 'GET' ? req.body : undefined,
        },
        ip: ip.split(',')[0].trim(),
        userAgent,
        status: isError ? 'failure' : 'success',
        city: req.body?.city || '',
        platform: req.body?.platform || '',
        durationMs,
        errorMessage: isError ? responseBody?.error || '' : '',
      });
    } catch (e) {
      // Never let logging crash the server
      console.warn('ActivityLog write failed:', e.message);
    }
  });

  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);

// ── Activity Logs endpoint (admin) ─────────────────────────────────────────
app.get('/api/logs', requireAdmin, async (req, res) => {
  try {
    const { limit = 100, userId, action, category } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (category) filter.category = category;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Summary counts
    const totalLogs = await ActivityLog.countDocuments();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayLogs = await ActivityLog.countDocuments({ createdAt: { $gte: today } });
    const errorLogs = await ActivityLog.countDocuments({ status: 'failure', createdAt: { $gte: today } });
    const uniqueUsers = await ActivityLog.distinct('userId', { userId: { $ne: 'anonymous' } });

    res.json({
      logs: logs.map(l => ({ id: l._id, ...l })),
      summary: { totalLogs, todayLogs, errorLogs, uniqueActiveUsers: uniqueUsers.length }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const [workers, activePolicies, totalClaims, totalLogs] = await Promise.all([
      Worker.countDocuments(),
      Policy.countDocuments({ status: 'active' }),
      Claim.countDocuments(),
      ActivityLog.countDocuments(),
    ]);
    const monitorStatus = getMonitorStatus();
    res.json({
      status: 'ok', service: 'ShramSuraksha API',
      version: '3.0.0', database: 'MongoDB',
      timestamp: new Date().toISOString(),
      workers, activePolicies, totalClaims, totalLogs,
      triggerMonitor: monitorStatus,
      features: ['income-linked-payouts', 'city-tier-analysis', 'behavioral-scoring', 'auto-trigger-monitor', 'gmail-otp', 'whatsapp-alerts', 'activity-logging'],
    });
  } catch (err) {
    res.json({ status: 'ok', service: 'ShramSuraksha API', database: 'error', error: err.message });
  }
});

// ── Public metrics endpoint for live dashboard cards ───────────────────────
app.get('/api/public-metrics', async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const [workersSafe, settledClaimsThisWeek] = await Promise.all([
      Worker.countDocuments(),
      Claim.find({
        status: 'settled',
        settledAt: { $gte: startOfWeek }
      }).lean(),
    ]);

    const paidThisWeek = settledClaimsThisWeek.reduce((sum, c) => sum + (c.payoutAmount || 0), 0);
    const under90Count = settledClaimsThisWeek.filter(c => (c.settleTime || 0) > 0 && (c.settleTime || 0) <= 90).length;
    const claimsUnder90Pct = settledClaimsThisWeek.length
      ? Math.round((under90Count / settledClaimsThisWeek.length) * 100)
      : 0;

    res.json({
      paidThisWeek,
      claimsUnder90Pct,
      workersSafe,
      settledClaimsThisWeek: settledClaimsThisWeek.length,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stats endpoint ─────────────────────────────────────────────────────────
app.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const { getCityTier } = await import('./models.js');
    const [totalWorkers, policies, claims, workers] = await Promise.all([
      Worker.countDocuments(),
      Policy.find().lean(),
      Claim.find().lean(),
      Worker.find().lean(),
    ]);
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const settledClaims = claims.filter(c => c.status === 'settled');
    const autoTriggeredClaims = claims.filter(c => c.autoTriggered).length;
    const totalPaidOut = settledClaims.reduce((s, c) => s + (c.payoutAmount || 0), 0);
    const avgSettleTime = settledClaims.length
      ? Math.round(settledClaims.reduce((s, c) => s + (c.settleTime || 0), 0) / settledClaims.length)
      : 0;
    const totalPremiums = policies.reduce((s, p) => s + (p.weeklyPremium || 0), 0);
    const lossRatio = totalPremiums > 0 ? ((totalPaidOut / totalPremiums) * 100).toFixed(1) : '0.0';
    const fraudFlags = claims.filter(c => c.fraudFlag).length;
    const monitorStatus = getMonitorStatus();

    // City tier breakdown
    const cityTierStats = { tier1: 0, tier2: 0, tier3: 0 };
    workers.forEach(w => { const t = getCityTier(w.city).tier; cityTierStats[t]++; });

    // Today's activity
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [todayLogs, totalLogs] = await Promise.all([
      ActivityLog.countDocuments({ createdAt: { $gte: today } }),
      ActivityLog.countDocuments(),
    ]);

    res.json({
      totalWorkers, activePolicies,
      totalClaims: claims.length, settledClaims: settledClaims.length,
      autoTriggeredClaims, totalPaidOut, avgSettleTime, lossRatio, fraudFlags,
      cityTierStats, monitorStatus,
      activityLogs: { total: totalLogs, today: todayLogs },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start server ───────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🛡️  ShramSuraksha API v3.0.0 running on port ${PORT}`);
    console.log(`    Health:   http://localhost:${PORT}/api/health`);
    console.log(`    Gmail OTP: ${process.env.GMAIL_USER ? '✅ ' + process.env.GMAIL_USER : '❌ Not configured'}`);
    console.log(`    Twilio:   ${process.env.TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`    Features: income-linked-payouts | city-tiers | behavioral-scoring | auto-trigger | activity-logging`);
  });

  // Start automated trigger monitor after DB is ready
  startTriggerMonitor();
}

start();
