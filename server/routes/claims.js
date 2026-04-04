import { Router } from 'express';
import { Worker, Policy, Claim, Alert } from '../models.js';

const router = Router();

const TRIGGERS = {
  heavy_rainfall: { threshold: 30, unit: 'mm/hr', payout: 480, source: 'IMD' },
  severe_aqi: { threshold: 200, unit: 'AQI', payout: 200, source: 'CPCB' },
  extreme_heat: { threshold: 42, unit: '°C', payout: 350, source: 'IMD' },
  flooding: { threshold: 50, unit: 'mm/hr', payout: 650, source: 'IMD' },
  storm: { threshold: 80, unit: 'km/h wind', payout: 550, source: 'IMD' },
  curfew: { threshold: 1, unit: 'active', payout: 400, source: 'Govt' }
};

router.get('/triggers', (req, res) => res.json(TRIGGERS));

// Get user's claims
router.get('/user/:userId', async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean();
    res.json(claims.map(c => ({ id: c._id, ...c })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// File a claim
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
    let fraudScore = 0, fraudFlag = false;
    const fraudReasons = [];

    // Weekly frequency check
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const weekCount = await Claim.countDocuments({ userId, createdAt: { $gte: weekAgo } });
    if (weekCount >= 5) { fraudScore += 0.3; fraudReasons.push('High claim frequency'); }

    // GPS check
    if (location && user) {
      const d = Math.sqrt(Math.pow(location.lat - user.gpsLat, 2) + Math.pow(location.lng - user.gpsLng, 2));
      if (d > 0.5) { fraudScore += 0.4; fraudReasons.push('GPS location anomaly'); }
    }
    if (fraudScore > 0.5) fraudFlag = true;

    let payoutAmount = trigger.payout;
    const plan = policy.plan;
    if (plan === 'basic') payoutAmount = Math.round(payoutAmount * 0.6);
    if (plan === 'premium') payoutAmount = Math.round(payoutAmount * 1.5);

    const settleTime = Math.floor(Math.random() * 60) + 45;

    const claim = await Claim.create({
      userId, policyId: policy._id.toString(), triggerType,
      triggerData: { value: triggerValue || trigger.threshold + Math.random() * 10, unit: trigger.unit, source: trigger.source, threshold: trigger.threshold },
      location: location || { lat: user?.gpsLat, lng: user?.gpsLng, zone: user?.zone, area: user?.city },
      payoutAmount: fraudFlag ? 0 : payoutAmount,
      status: fraudFlag ? 'under_review' : 'settled',
      fraudFlag, fraudScore: parseFloat(fraudScore.toFixed(2)), fraudReasons,
      verifiedGPS: !fraudFlag, wasWorking: wasWorking !== false,
      settleTime: fraudFlag ? null : settleTime,
      settledAt: fraudFlag ? null : new Date(Date.now() + settleTime * 1000),
      paymentRef: fraudFlag ? null : 'UPI-REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userName: user?.name, userPlatform: user?.platform,
    });

    if (!fraudFlag && user) {
      await Worker.findByIdAndUpdate(userId, { $inc: { totalEarningsProtected: payoutAmount } });
    }

    await Alert.create({
      type: triggerType,
      title: trigger.source + ' Alert: ' + triggerType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `${trigger.source} detected ${triggerType.replace(/_/g, ' ')} exceeding threshold`,
      severity: fraudFlag ? 'fraud' : 'high',
      zone: user?.zone || 'unknown', city: user?.city || 'unknown',
      triggerValue: triggerValue || trigger.threshold + Math.random() * 10,
      threshold: trigger.threshold, payoutTriggered: !fraudFlag,
      payoutAmount: fraudFlag ? 0 : payoutAmount,
    });

    res.status(201).json({
      success: true,
      claim: { id: claim._id, ...claim.toObject() },
      message: fraudFlag
        ? '⚠️ Claim flagged for review.'
        : `✅ Claim approved! ₹${payoutAmount} credited via UPI in ${settleTime}s.`
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// All claims (admin)
router.get('/all', async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 }).lean();
    res.json(claims.map(c => ({ id: c._id, ...c })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).lean();
    res.json(alerts.map(a => ({ id: a._id, ...a })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
