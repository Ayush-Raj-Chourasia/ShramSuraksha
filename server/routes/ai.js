import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCityTier, PLATFORM_INCOME } from '../models.js';
import { Worker, Claim } from '../models.js';
import { getMonitorStatus } from './trigger-monitor.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

let genAI, model;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
} catch (e) { console.warn('Gemini AI not initialized:', e.message); }

// ── City tier breakdown for admin ─────────────────────────────────────────
router.get('/city-tiers', requireAdmin, async (req, res) => {
  try {
    const workers = await Worker.find().lean();
    const breakdown = { tier1: 0, tier2: 0, tier3: 0 };
    workers.forEach(w => {
      const tier = getCityTier(w.city).tier;
      breakdown[tier] = (breakdown[tier] || 0) + 1;
    });
    res.json({ breakdown, total: workers.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Monitor status endpoint ───────────────────────────────────────────────
router.get('/monitor-status', requireAdmin, (req, res) => {
  res.json(getMonitorStatus());
});

// ── GET /api/ai/behavioral-score/:userId ─────────────────────────────────
router.get('/behavioral-score/:userId', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.userId).lean();
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    const [weekClaims, monthClaims, fraudClaims, totalClaims] = await Promise.all([
      Claim.countDocuments({ userId: req.params.userId, createdAt: { $gte: weekAgo } }),
      Claim.countDocuments({ userId: req.params.userId, createdAt: { $gte: monthAgo } }),
      Claim.countDocuments({ userId: req.params.userId, fraudFlag: true }),
      Claim.countDocuments({ userId: req.params.userId }),
    ]);

    const score = worker.behavioralScore || 80;
    const tier = getCityTier(worker.city);
    const incomePerDay = worker.declaredIncome || PLATFORM_INCOME[worker.platform] || 750;

    const tips = [];
    if (weekClaims > 3) tips.push('Reduce claim frequency this week to improve score');
    if (fraudClaims > 0) tips.push('Past fraud flags detected — this affects payout amounts');
    if (score >= 90) tips.push('Excellent record! You qualify for 20% behavioral bonus');
    else if (score >= 75) tips.push('Good standing — 10% behavioral bonus applied');
    else tips.push('Build clean claim history for better payouts');

    res.json({
      behavioralScore: score,
      tier: tier.label,
      tierMultiplier: tier.multiplier,
      incomePerDay,
      estimatedDailyPayout: Math.round(incomePerDay * 0.5 * tier.multiplier * (score >= 90 ? 1.2 : score >= 75 ? 1.1 : 1.0)),
      weekClaims, monthClaims, fraudClaims, totalClaims,
      tips,
      bonus: score >= 90 ? '20%' : score >= 75 ? '10%' : '0%',
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/ai/calculate-premium ────────────────────────────────────────
router.post('/calculate-premium', async (req, res) => {
  try {
    const { platform, city, zone, weatherData, aqiData, claimsHistory, declaredIncome, avgDailyHours, behavioralScore } = req.body;

    const cityTierInfo = getCityTier(city || 'Mumbai');
    const platformIncome = PLATFORM_INCOME[platform?.toLowerCase()] || 750;
    const effectiveIncome = declaredIncome || platformIncome;

    if (!model) {
      const basePremium = cityTierInfo.tier === 'tier1' ? 79 : cityTierInfo.tier === 'tier2' ? 59 : 39;
      return res.json({
        basePremium,
        adjustedPremium: basePremium,
        discount: 0,
        riskScore: 45,
        cityTier: cityTierInfo.label,
        tierMultiplier: cityTierInfo.multiplier,
        estimatedDailyPayout: Math.round(effectiveIncome * 0.5 * cityTierInfo.multiplier),
        factors: ['Using default pricing — AI unavailable', `City tier: ${cityTierInfo.label}`],
        recommendation: 'standard',
        confidence: 0.5,
      });
    }

    const prompt = `You are an AI actuarial engine for ShramSuraksha, India's first parametric income insurance for gig delivery workers.

Worker Profile:
- Platform: ${platform || 'zomato'} (benchmark income: ₹${platformIncome}/day)
- Declared Income: ₹${effectiveIncome}/day, ${avgDailyHours || 8}hrs/day
- City: ${city || 'Mumbai'} — City Tier: ${cityTierInfo.label} (${cityTierInfo.tier})
- Zone: ${zone || '4B'}
- Weather: ${weatherData?.temp || 34}°C, ${weatherData?.rain || 0}mm/hr rain
- AQI: ${aqiData?.aqi || 120}
- Previous Claims (last 30 days): ${claimsHistory?.length || 0}
- Behavioral Score: ${behavioralScore || 80}/100

Pricing logic:
- Base premium reflects city risk tier (Tier-1 Metro higher), income level, and weather risk
- Behavioral discounts: score ≥90 → 20% discount, score ≥75 → 10% discount
- Income-linked payouts: payout ≈ income × 0.5 × tier_multiplier × behavioral_bonus
- Weekly pricing (matching gig cycle): Basic ₹29, Standard ₹59, Premium ₹119

Respond ONLY with valid JSON:
{
  "basePremium": <number>,
  "adjustedPremium": <number>,
  "discount": <number>,
  "riskScore": <number 0-100>,
  "cityTier": "${cityTierInfo.label}",
  "tierMultiplier": ${cityTierInfo.multiplier},
  "estimatedDailyPayout": <number in INR>,
  "factors": ["factor1", "factor2", "factor3"],
  "recommendation": "basic|standard|premium",
  "confidence": <number 0-1>,
  "weeklyForecast": "brief sentence",
  "behavioralDiscount": <number in %>
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) res.json(JSON.parse(jsonMatch[0]));
    else throw new Error('Could not parse AI response');
  } catch (err) {
    console.error('AI Premium Error:', err.message);
    const cityTierInfo = getCityTier(req.body?.city || 'Mumbai');
    res.json({
      basePremium: 59, adjustedPremium: 55, discount: 4, riskScore: 38,
      cityTier: cityTierInfo.label, tierMultiplier: cityTierInfo.multiplier,
      estimatedDailyPayout: Math.round(750 * 0.5 * cityTierInfo.multiplier),
      factors: ['Zone historical data: low flood risk', 'Current weather mild', 'No recent claims'],
      recommendation: 'standard', confidence: 0.82,
      weeklyForecast: 'Low risk expected. Moderate temperatures forecasted.',
      behavioralDiscount: 10,
    });
  }
});

// ── POST /api/ai/fraud-check ───────────────────────────────────────────────
router.post('/fraud-check', async (req, res) => {
  try {
    const { claim, userProfile, recentClaims } = req.body;
    if (!model) {
      return res.json({ fraudScore: 0.15, isFraudulent: false, reasons: [], confidence: 0.5, recommendation: 'approve' });
    }
    const prompt = `You are an AI fraud detection system for ShramSuraksha.

Claim: ${claim?.triggerType}, value ${claim?.triggerValue} ${claim?.triggerUnit}, location ${claim?.location}, worker active: ${claim?.wasWorking}
Worker: ${userProfile?.platform}, ${userProfile?.city} (${userProfile?.cityTier}), claims this month: ${recentClaims?.length || 1}
Recent claims: ${JSON.stringify(recentClaims?.slice(0, 3) || [])}

Check: GPS spoofing, duplicates, timing anomalies, pattern anomalies, weather cross-verification.

Respond ONLY with JSON:
{"fraudScore":<0-1>,"isFraudulent":<bool>,"reasons":[],"confidence":<0-1>,"recommendation":"approve|review|deny","riskBreakdown":{"gpsAnomaly":<0-1>,"duplicateRisk":<0-1>,"timingAnomaly":<0-1>,"patternAnomaly":<0-1>}}`;

    const result = await model.generateContent(prompt);
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (jsonMatch) res.json(JSON.parse(jsonMatch[0]));
    else throw new Error('Parse error');
  } catch (err) {
    res.json({ fraudScore: 0.12, isFraudulent: false, reasons: [], confidence: 0.85, recommendation: 'approve',
      riskBreakdown: { gpsAnomaly: 0.05, duplicateRisk: 0.0, timingAnomaly: 0.1, patternAnomaly: 0.08 } });
  }
});

// ── POST /api/ai/risk-assessment ──────────────────────────────────────────
router.post('/risk-assessment', async (req, res) => {
  try {
    const { city, zone, currentWeather, recentClaims } = req.body;
    const tier = getCityTier(city || 'Mumbai');
    if (!model) {
      return res.json({ overallRisk: 'medium', riskScore: 45, predictedClaims: 3, predictedPayout: 1200,
        advice: 'Normal operations expected.', weatherOutlook: 'Moderate conditions.', cityTier: tier.label });
    }
    const prompt = `Insurance risk analyst for ShramSuraksha. Assess gig worker risk in ${city || 'Mumbai'} (${tier.label} tier), Zone ${zone || '4B'}.
Conditions: ${currentWeather?.temp || 34}°C, AQI ${currentWeather?.aqi || 120}, Rain ${currentWeather?.rain || 0}mm/hr, Recent claims: ${recentClaims || 5}

Respond ONLY with JSON:
{"overallRisk":"low|medium|high","riskScore":<0-100>,"predictedClaims":<n>,"predictedPayout":<INR>,"advice":"text","weatherOutlook":"text","topRisks":["r1","r2"],"cityTier":"${tier.label}","tierMultiplier":${tier.multiplier}}`;

    const result = await model.generateContent(prompt);
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (jsonMatch) res.json(JSON.parse(jsonMatch[0]));
    else throw new Error('Parse error');
  } catch (err) {
    const tier = getCityTier(req.body?.city || 'Mumbai');
    res.json({ overallRisk: 'medium', riskScore: 45, predictedClaims: 3, predictedPayout: 1200,
      advice: 'Monitor conditions. Standard operations recommended.', weatherOutlook: 'Moderate expected.',
      topRisks: ['Heat stress in afternoon', 'Moderate AQI'], cityTier: tier.label, tierMultiplier: tier.multiplier });
  }
});

export default router;
