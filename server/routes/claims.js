import { Router } from 'express';
import { Worker, Policy, Claim, Alert } from '../models.js';
import { getCityTier, PLATFORM_INCOME } from '../models.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// ── Twilio WhatsApp client ─────────────────────────────────────────────────
let twilioClient = null;
try {
  const twilio = await import('twilio');
  twilioClient = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} catch (e) { console.warn('Twilio not initialized:', e.message); }

async function sendWhatsApp(to, message) {
  if (!twilioClient) return;
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:+91${to.replace(/\D/g, '')}`,
      body: message,
    });
  } catch (err) { console.warn('WhatsApp send failed:', err.message); }
}

// ── Parametric trigger definitions ────────────────────────────────────────
const TRIGGERS = {
  heavy_rainfall: { threshold: 30, unit: 'mm/hr', baseRate: 1.0, source: 'IMD', emoji: '🌧️' },
  severe_aqi:     { threshold: 200, unit: 'AQI', baseRate: 0.6,  source: 'CPCB', emoji: '😷' },
  extreme_heat:   { threshold: 42, unit: '°C',   baseRate: 0.8,  source: 'IMD', emoji: '🌡️' },
  flooding:       { threshold: 50, unit: 'mm/hr', baseRate: 1.3, source: 'IMD', emoji: '🌊' },
  storm:          { threshold: 80, unit: 'km/h',  baseRate: 1.1, source: 'IMD', emoji: '⛈️' },
  curfew:         { threshold: 1,  unit: 'active',baseRate: 0.9, source: 'Govt',emoji: '🚫' },
};

// ── Income-linked payout calculation ─────────────────────────────────────
// Formula: basePayout = declaredIncome × hoursLost(~0.5 day) × tierMultiplier × behavioralBonus × planFactor
// This ties payouts directly to verified earning capacity, not flat amounts
function calcIncomePayout({ trigger, user, policy, plan }) {
  const income = user.declaredIncome || PLATFORM_INCOME[user.platform] || 750;
  const hours = user.avgDailyHours || 8;
  const hoursLostRatio = user.triggerHoursLost || 0.5; // default: 50% of work day lost

  // Base payout from income
  const hourlyRate = income / hours;
  const baseFromIncome = Math.round(hourlyRate * hours * hoursLostRatio);

  // Tier multiplier (Tier-1 cities = higher cost of living = higher payout)
  const tierInfo = getCityTier(user.city);
  const tierMultiplier = tierInfo.multiplier || 1.0;

  // Behavioral bonus: high behavioral score → up to 20% bonus
  const behavScore = user.behavioralScore || 80;
  const behavioralBonus = behavScore >= 90 ? 1.2 : behavScore >= 75 ? 1.1 : behavScore >= 60 ? 1.0 : 0.9;

  // Plan factor
  const planFactor = plan === 'basic' ? 0.6 : plan === 'premium' ? 1.5 : 1.0;

  // Trigger severity multiplier
  const triggerBase = trigger.baseRate || 1.0;

  const payout = Math.round(baseFromIncome * tierMultiplier * behavioralBonus * planFactor * triggerBase);
  return {
    payoutAmount: Math.max(payout, 100), // minimum ₹100
    basePayoutAmount: baseFromIncome,
    incomeMultiplier: hoursLostRatio,
    tierMultiplier,
    behavioralBonus,
  };
}

// ── Behavioral risk scoring ───────────────────────────────────────────────
async function calcBehavioralScore(userId) {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const [weekClaims, monthClaims, fraudClaims] = await Promise.all([
    Claim.countDocuments({ userId, createdAt: { $gte: weekAgo } }),
    Claim.countDocuments({ userId, createdAt: { $gte: monthAgo } }),
    Claim.countDocuments({ userId, fraudFlag: true }),
  ]);
  let score = 100;
  if (weekClaims > 3) score -= 20;
  else if (weekClaims > 1) score -= 10;
  if (monthClaims > 8) score -= 20;
  if (fraudClaims > 0) score -= 30;
  return Math.max(0, score);
}

router.get('/triggers', (req, res) => res.json(TRIGGERS));

// ── GET /api/claims/user/:userId ──────────────────────────────────────────
router.get('/user/:userId', async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean();
    res.json(claims.map(c => ({ id: c._id, ...c })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/claims/file ─────────────────────────────────────────────────
router.post('/file', async (req, res) => {
  try {
    const { userId, triggerType, triggerValue, location, wasWorking } = req.body;
    if (!userId || !triggerType) return res.status(400).json({ error: 'userId and triggerType are required' });

    const policy = await Policy.findOne({ userId, status: 'active' });
    if (!policy) return res.status(400).json({ error: 'No active policy found.' });

    const trigger = TRIGGERS[triggerType];
    if (!trigger) return res.status(400).json({ error: 'Invalid trigger type' });

    // Duplicate check (6h window)
    const sixHoursAgo = new Date(Date.now() - 6 * 3600000);
    const dup = await Claim.findOne({ userId, triggerType, createdAt: { $gte: sixHoursAgo } });
    if (dup) return res.status(400).json({ error: 'Duplicate claim within 6 hours.', existingClaim: dup });

    const user = await Worker.findById(userId).lean();

    // ── Fraud detection ────────────────────────────────────────────────────
    let fraudScore = 0; let fraudFlag = false;
    const fraudReasons = [];

    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const weekCount = await Claim.countDocuments({ userId, createdAt: { $gte: weekAgo } });
    if (weekCount >= 5) { fraudScore += 0.3; fraudReasons.push('High claim frequency (5+ this week)'); }

    if (location && user) {
      const d = Math.sqrt(Math.pow(location.lat - user.gpsLat, 2) + Math.pow(location.lng - user.gpsLng, 2));
      if (d > 0.5) { fraudScore += 0.4; fraudReasons.push('GPS location anomaly (>50km drift)'); }
    }

    const prevFraud = await Claim.countDocuments({ userId, fraudFlag: true });
    if (prevFraud > 0) { fraudScore += 0.2; fraudReasons.push('Prior fraud history'); }

    if (fraudScore > 0.5) fraudFlag = true;

    // ── Income-linked payout ───────────────────────────────────────────────
    const payoutCalc = calcIncomePayout({ trigger, user, policy, plan: policy.plan });
    const { payoutAmount, basePayoutAmount, incomeMultiplier, tierMultiplier, behavioralBonus } = payoutCalc;

    // Update behavioral score
    const newBehavScore = await calcBehavioralScore(userId);
    await Worker.findByIdAndUpdate(userId, { behavioralScore: newBehavScore });

    const settleTime = Math.floor(Math.random() * 60) + 45;

    const claim = await Claim.create({
      userId, policyId: policy._id.toString(), triggerType,
      triggerData: {
        value: triggerValue || trigger.threshold + Math.random() * 10,
        unit: trigger.unit, source: trigger.source, threshold: trigger.threshold
      },
      location: location || { lat: user?.gpsLat, lng: user?.gpsLng, zone: user?.zone, area: user?.city },
      payoutAmount: fraudFlag ? 0 : payoutAmount,
      basePayoutAmount, incomeMultiplier, tierMultiplier, behavioralBonus,
      status: fraudFlag ? 'under_review' : 'settled',
      fraudFlag, fraudScore: parseFloat(fraudScore.toFixed(2)), fraudReasons,
      verifiedGPS: !fraudFlag, wasWorking: wasWorking !== false,
      settleTime: fraudFlag ? null : settleTime,
      settledAt: fraudFlag ? null : new Date(Date.now() + settleTime * 1000),
      paymentRef: fraudFlag ? null : 'UPI-REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userName: user?.name, userPlatform: user?.platform,
      autoTriggered: false,
    });

    if (!fraudFlag && user) {
      await Worker.findByIdAndUpdate(userId,
        { $inc: { totalEarningsProtected: payoutAmount, totalClaims: 1 } }
      );

      // Send WhatsApp confirmation
      if (user.whatsappOptIn && user.phone) {
        const tier = getCityTier(user.city);
        await sendWhatsApp(user.phone,
          `✅ *ShramSuraksha Claim Approved!*\n\n` +
          `${trigger.emoji} *Trigger:* ${triggerType.replace(/_/g, ' ').toUpperCase()}\n` +
          `💰 *Payout:* ₹${payoutAmount}\n` +
          `📍 *City Tier:* ${tier.label}\n` +
          `⚡ *Settle Time:* ${settleTime}s\n` +
          `🔖 *Ref:* ${claim.paymentRef}\n\n` +
          `Your income protection is working. Stay safe! 🛡️`
        );
      }
    }

    const tierLabel = getCityTier(user?.city || 'Mumbai').label;
    await Alert.create({
      type: triggerType,
      title: `${trigger.source} Alert: ${triggerType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      description: `${trigger.source} detected ${triggerType.replace(/_/g, ' ')} exceeding threshold in ${user?.city}`,
      severity: fraudFlag ? 'fraud' : 'high',
      zone: user?.zone || 'unknown', city: user?.city || 'unknown',
      cityTier: tierLabel,
      triggerValue: triggerValue || trigger.threshold + Math.random() * 10,
      threshold: trigger.threshold, payoutTriggered: !fraudFlag,
      payoutAmount: fraudFlag ? 0 : payoutAmount,
    });

    res.status(201).json({
      success: true,
      claim: { id: claim._id, ...claim.toObject() },
      payoutBreakdown: { basePayoutAmount, incomeMultiplier, tierMultiplier, behavioralBonus, tierLabel },
      message: fraudFlag
        ? '⚠️ Claim flagged for review due to risk signals.'
        : `✅ Claim approved! ₹${payoutAmount} credited via UPI in ${settleTime}s. (Income-linked: base ₹${basePayoutAmount} × ${tierLabel} tier × behavioral bonus)`
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/claims/all ───────────────────────────────────────────────────
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 }).lean();
    res.json(claims.map(c => ({ id: c._id, ...c })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/claims/alerts ────────────────────────────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).lean();
    res.json(alerts.map(a => ({ id: a._id, ...a })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export { TRIGGERS, calcIncomePayout, sendWhatsApp };
export default router;
