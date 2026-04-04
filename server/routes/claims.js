import { Router } from 'express';
import { db, generateId } from '../store.js';

const router = Router();

// Parametric trigger thresholds
const TRIGGERS = {
  heavy_rainfall: { threshold: 30, unit: 'mm/hr', payout: 480, source: 'IMD' },
  severe_aqi: { threshold: 200, unit: 'AQI', payout: 200, source: 'CPCB' },
  extreme_heat: { threshold: 42, unit: '°C', payout: 350, source: 'IMD' },
  flooding: { threshold: 50, unit: 'mm/hr', payout: 650, source: 'IMD' },
  storm: { threshold: 80, unit: 'km/h wind', payout: 550, source: 'IMD' },
  curfew: { threshold: 1, unit: 'active', payout: 400, source: 'Govt' }
};

// Get trigger definitions
router.get('/triggers', (req, res) => {
  res.json(TRIGGERS);
});

// Get user's claims
router.get('/user/:userId', (req, res) => {
  const claims = db.claims
    .filter(c => c.userId === req.params.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(claims);
});

// File a claim (parametric auto-trigger)
router.post('/file', (req, res) => {
  try {
    const { userId, triggerType, triggerValue, location, wasWorking } = req.body;
    
    if (!userId || !triggerType) {
      return res.status(400).json({ error: 'userId and triggerType are required' });
    }
    
    // Verify user has active policy
    const policy = db.policies.find(p => p.userId === userId && p.status === 'active');
    if (!policy) {
      return res.status(400).json({ error: 'No active policy found. Please activate a plan first.' });
    }
    
    const trigger = TRIGGERS[triggerType];
    if (!trigger) {
      return res.status(400).json({ error: 'Invalid trigger type' });
    }
    
    // Check for duplicate claims (same trigger type within 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 3600000).toISOString();
    const duplicate = db.claims.find(c => 
      c.userId === userId && 
      c.triggerType === triggerType && 
      c.createdAt > sixHoursAgo
    );
    
    if (duplicate) {
      return res.status(400).json({ 
        error: 'Duplicate claim detected. A similar claim was filed within the last 6 hours.',
        existingClaim: duplicate
      });
    }
    
    // Fraud detection - basic checks
    const user = db.users.find(u => u.id === userId);
    let fraudScore = 0;
    let fraudFlag = false;
    const fraudReasons = [];
    
    // Check if user has too many claims this week
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const weekClaims = db.claims.filter(c => c.userId === userId && c.createdAt > weekAgo);
    if (weekClaims.length >= 5) {
      fraudScore += 0.3;
      fraudReasons.push('High claim frequency');
    }
    
    // GPS validation
    if (location && user) {
      const distance = Math.sqrt(
        Math.pow(location.lat - user.gpsLat, 2) + 
        Math.pow(location.lng - user.gpsLng, 2)
      );
      if (distance > 0.5) {
        fraudScore += 0.4;
        fraudReasons.push('GPS location anomaly');
      }
    }
    
    if (fraudScore > 0.5) {
      fraudFlag = true;
    }
    
    // Calculate payout based on trigger and policy
    let payoutAmount = trigger.payout;
    if (policy.plan === 'basic') payoutAmount = Math.round(payoutAmount * 0.6);
    if (policy.plan === 'premium') payoutAmount = Math.round(payoutAmount * 1.5);
    
    const settleTime = Math.floor(Math.random() * 60) + 45; // 45-105 seconds
    
    const claim = {
      id: generateId('claim-'),
      userId,
      policyId: policy.id,
      triggerType,
      triggerData: {
        value: triggerValue || trigger.threshold + Math.random() * 10,
        unit: trigger.unit,
        source: trigger.source,
        threshold: trigger.threshold
      },
      location: location || { lat: user?.gpsLat, lng: user?.gpsLng, zone: user?.zone, area: user?.city },
      payoutAmount: fraudFlag ? 0 : payoutAmount,
      status: fraudFlag ? 'under_review' : 'settled',
      fraudFlag,
      fraudScore: parseFloat(fraudScore.toFixed(2)),
      fraudReasons,
      verifiedGPS: !fraudFlag,
      wasWorking: wasWorking !== false,
      settleTime: fraudFlag ? null : settleTime,
      createdAt: new Date().toISOString(),
      settledAt: fraudFlag ? null : new Date(Date.now() + settleTime * 1000).toISOString(),
      paymentMethod: 'UPI',
      paymentRef: fraudFlag ? null : 'UPI-REF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    db.claims.push(claim);
    
    // Update user earnings
    if (!fraudFlag && user) {
      user.totalEarningsProtected += payoutAmount;
    }
    
    // Create alert
    db.alerts.push({
      id: generateId('alert-'),
      type: triggerType,
      title: trigger.source + ' Alert: ' + triggerType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `${trigger.source} detected ${triggerType.replace(/_/g, ' ')} exceeding threshold`,
      severity: fraudFlag ? 'fraud' : 'high',
      zone: user?.zone || 'unknown',
      city: user?.city || 'unknown',
      triggerValue: triggerValue || trigger.threshold + Math.random() * 10,
      threshold: trigger.threshold,
      payoutTriggered: !fraudFlag,
      payoutAmount: fraudFlag ? 0 : payoutAmount,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      claim,
      message: fraudFlag 
        ? '⚠️ Claim filed but flagged for review. Our team will verify within 24 hours.'
        : `✅ Claim approved! ₹${payoutAmount} will be credited via UPI in ${settleTime}s.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all claims (admin)
router.get('/all', (req, res) => {
  const claims = db.claims.map(c => {
    const user = db.users.find(u => u.id === c.userId);
    return { ...c, userName: user?.name, userPlatform: user?.platform };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(claims);
});

// Get alerts
router.get('/alerts', (req, res) => {
  const alerts = db.alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(alerts);
});

export default router;
