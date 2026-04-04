import { Router } from 'express';
import { supabase } from '../store.js';

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

router.get('/user/:userId', async (req, res) => {
  try {
    const { data: claims } = await supabase.from('claims').select('*').eq('userId', req.params.userId).order('created_at', { ascending: false });
    res.json(claims || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/file', async (req, res) => {
  try {
    const { userId, triggerType, triggerValue, location, wasWorking } = req.body;
    if (!userId || !triggerType) return res.status(400).json({ error: 'userId and triggerType required' });

    const { data: policy } = await supabase.from('policies').select('*').eq('userId', userId).eq('status', 'active').single();
    if (!policy) return res.status(400).json({ error: 'No active policy found.' });

    const trigger = TRIGGERS[triggerType];
    if (!trigger) return res.status(400).json({ error: 'Invalid trigger' });

    const sixHoursAgo = new Date(Date.now() - 6 * 3600000).toISOString();
    const { data: dup } = await supabase.from('claims').select('*').eq('userId', userId).eq('triggerType', triggerType).gte('created_at', sixHoursAgo).single();
    if (dup) return res.status(400).json({ error: 'Duplicate claim within 6 hours.', existingClaim: dup });

    const { data: user } = await supabase.from('workers').select('*').eq('id', userId).single();
    let fraudScore = 0, fraudFlag = false;
    const fraudReasons = [];

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { count: weekCount } = await supabase.from('claims').select('*', { count: 'exact', head: true }).eq('userId', userId).gte('created_at', weekAgo);
    if (weekCount >= 5) { fraudScore += 0.3; fraudReasons.push('High frequency'); }

    if (location && user) {
      const d = Math.sqrt(Math.pow(location.lat - user.gpsLat, 2) + Math.pow(location.lng - user.gpsLng, 2));
      if (d > 0.5) { fraudScore += 0.4; fraudReasons.push('GPS anomaly'); }
    }
    if (fraudScore > 0.5) fraudFlag = true;

    let payoutAmount = trigger.payout;
    if (policy.plan === 'basic') payoutAmount = Math.round(payoutAmount * 0.6);
    if (policy.plan === 'premium') payoutAmount = Math.round(payoutAmount * 1.5);

    const settleTime = Math.floor(Math.random() * 60) + 45;

    const { data: claim, error } = await supabase.from('claims').insert({
      userId, policyId: policy.id, triggerType,
      triggerData: { value: triggerValue || trigger.threshold + Math.random() * 10, unit: trigger.unit, source: trigger.source, threshold: trigger.threshold },
      location: location || { lat: user?.gpsLat, lng: user?.gpsLng, zone: user?.zone, area: user?.city },
      payoutAmount: fraudFlag ? 0 : payoutAmount,
      status: fraudFlag ? 'under_review' : 'settled',
      fraudFlag, fraudScore: parseFloat(fraudScore.toFixed(2)), fraudReasons,
      verifiedGPS: !fraudFlag, wasWorking: wasWorking !== false,
      settleTime: fraudFlag ? null : settleTime,
      settledAt: fraudFlag ? null : new Date(Date.now() + settleTime * 1000).toISOString(),
      paymentRef: fraudFlag ? null : 'UPI-REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userName: user?.name, userPlatform: user?.platform,
    }).select().single();

    if (error) throw error;

    if (!fraudFlag && user) {
      await supabase.from('workers').update({ totalEarningsProtected: (user.totalEarningsProtected || 0) + payoutAmount }).eq('id', userId);
    }

    await supabase.from('alerts').insert({
      type: triggerType, title: trigger.source + ' Alert: ' + triggerType,
      description: `${trigger.source} detected ${triggerType} threshold exceeded`,
      severity: fraudFlag ? 'fraud' : 'high',
      zone: user?.zone || 'unknown', city: user?.city || 'unknown',
      triggerValue: triggerValue || trigger.threshold + 5,
      threshold: trigger.threshold, payoutTriggered: !fraudFlag,
      payoutAmount: fraudFlag ? 0 : payoutAmount,
    });

    res.status(201).json({
      success: true, claim,
      message: fraudFlag ? '⚠️ Flagged for review.' : `✅ Approved! ₹${payoutAmount} credited.`
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/all', async (req, res) => {
  try {
    const { data: claims } = await supabase.from('claims').select('*').order('created_at', { ascending: false });
    res.json(claims || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/alerts', async (req, res) => {
  try {
    const { data: alerts } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    res.json(alerts || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
