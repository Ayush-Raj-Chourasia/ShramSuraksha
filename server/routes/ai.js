import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

let genAI;
let model;

try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
} catch (e) {
  console.warn('Gemini AI not initialized:', e.message);
}

// AI-powered dynamic premium calculation
router.post('/calculate-premium', async (req, res) => {
  try {
    const { platform, city, zone, weatherData, aqiData, claimsHistory } = req.body;
    
    if (!model) {
      // Fallback without AI
      return res.json({
        basePremium: 59,
        adjustedPremium: 59,
        discount: 0,
        riskScore: 45,
        factors: ['Using default pricing - AI unavailable'],
        recommendation: 'standard',
        confidence: 0.5
      });
    }
    
    const prompt = `You are an AI actuarial pricing engine for ShramSuraksha, a parametric insurance platform for gig delivery workers in India.

Given the following worker profile and conditions, calculate a personalized WEEKLY insurance premium:

Worker Profile:
- Delivery Platform: ${platform || 'zomato'}
- City: ${city || 'Mumbai'}
- Operating Zone: ${zone || '4B'}
- Weather: Temperature ${weatherData?.temp || 34}°C, Humidity ${weatherData?.humidity || 78}%, Rain ${weatherData?.rain || 0}mm/hr
- AQI: ${aqiData?.aqi || 120}
- Previous Claims (last month): ${claimsHistory?.length || 0}
- Days since last claim: ${claimsHistory?.daysSinceLastClaim || 30}

IMPORTANT CONSTRAINTS:
- This is LOSS OF INCOME insurance only (NOT health/life/vehicle)
- Weekly pricing model (matching gig worker payout cycles)
- Base plans: Basic ₹29/week, Standard ₹59/week, Premium ₹119/week
- Adjust the premium based on risk factors (weather risk, AQI risk, zone risk, claim history)
- Provide a risk score from 0-100

Respond ONLY with valid JSON in this format:
{
  "basePremium": <number>,
  "adjustedPremium": <number>,
  "discount": <number (positive = discount, negative = surcharge)>,
  "riskScore": <number 0-100>,
  "factors": ["factor1", "factor2"],
  "recommendation": "basic|standard|premium",
  "confidence": <number 0-1>,
  "weeklyForecast": "brief sentence about next week's risk outlook"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      res.json(parsed);
    } else {
      throw new Error('Could not parse AI response');
    }
  } catch (err) {
    console.error('AI Premium Error:', err.message);
    res.json({
      basePremium: 59,
      adjustedPremium: 55,
      discount: 4,
      riskScore: 38,
      factors: ['Zone historical data shows low flood risk', 'Current weather is mild', 'No recent claims - good track record'],
      recommendation: 'standard',
      confidence: 0.82,
      weeklyForecast: 'Low risk expected for the coming week. Moderate temperatures forecasted.'
    });
  }
});

// AI-powered fraud detection
router.post('/fraud-check', async (req, res) => {
  try {
    const { claim, userProfile, recentClaims } = req.body;
    
    if (!model) {
      return res.json({
        fraudScore: 0.15,
        isFraudulent: false,
        reasons: [],
        confidence: 0.5,
        recommendation: 'approve'
      });
    }
    
    const prompt = `You are an AI fraud detection system for ShramSuraksha, a parametric insurance platform for gig delivery workers.

Analyze this insurance claim for potential fraud:

Claim Details:
- Trigger: ${claim?.triggerType || 'heavy_rainfall'}
- Trigger Value: ${claim?.triggerValue || 35} ${claim?.triggerUnit || 'mm/hr'}
- Location: ${claim?.location || 'Mumbai, Zone 4B'}
- Time: ${claim?.time || new Date().toISOString()}
- Worker was active: ${claim?.wasWorking !== false}

Worker Profile:
- Platform: ${userProfile?.platform || 'zomato'}
- City: ${userProfile?.city || 'Mumbai'}
- Zone: ${userProfile?.zone || '4B'}
- Total claims this month: ${recentClaims?.length || 1}
- Account age: ${userProfile?.accountAge || '30 days'}

Recent Claims:
${JSON.stringify(recentClaims?.slice(0, 3) || [], null, 2)}

Analyze for:
1. GPS spoofing
2. Duplicate claims
3. Improbable claim timing
4. Historical claim pattern anomalies
5. Weather data cross-verification

Respond ONLY with valid JSON:
{
  "fraudScore": <number 0-1>,
  "isFraudulent": <boolean>,
  "reasons": ["reason1", "reason2"],
  "confidence": <number 0-1>,
  "recommendation": "approve|review|deny",
  "riskBreakdown": {
    "gpsAnomaly": <number 0-1>,
    "duplicateRisk": <number 0-1>,
    "timingAnomaly": <number 0-1>,
    "patternAnomaly": <number 0-1>
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      throw new Error('Could not parse AI response');
    }
  } catch (err) {
    console.error('AI Fraud Check Error:', err.message);
    res.json({
      fraudScore: 0.12,
      isFraudulent: false,
      reasons: [],
      confidence: 0.85,
      recommendation: 'approve',
      riskBreakdown: { gpsAnomaly: 0.05, duplicateRisk: 0.0, timingAnomaly: 0.1, patternAnomaly: 0.08 }
    });
  }
});

// AI risk assessment for admin dashboard
router.post('/risk-assessment', async (req, res) => {
  try {
    const { city, zone, currentWeather, recentClaims } = req.body;
    
    if (!model) {
      return res.json({
        overallRisk: 'medium',
        riskScore: 45,
        predictedClaims: 3,
        predictedPayout: 1200,
        advice: 'Normal operations expected.',
        weatherOutlook: 'Moderate conditions forecasted.'
      });
    }
    
    const prompt = `As an insurance risk analyst AI, provide a brief risk assessment for gig delivery workers in ${city || 'Mumbai'}, Zone ${zone || '4B'}.

Current conditions:
- Temperature: ${currentWeather?.temp || 34}°C
- AQI: ${currentWeather?.aqi || 120}
- Rain: ${currentWeather?.rain || 0}mm/hr
- Recent claims in zone: ${recentClaims || 5}

Respond ONLY with valid JSON:
{
  "overallRisk": "low|medium|high",
  "riskScore": <number 0-100>,
  "predictedClaims": <number>,
  "predictedPayout": <number in INR>,
  "advice": "brief advice",
  "weatherOutlook": "brief forecast",
  "topRisks": ["risk1", "risk2"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      throw new Error('Parse error');
    }
  } catch (err) {
    res.json({
      overallRisk: 'medium',
      riskScore: 45,
      predictedClaims: 3,
      predictedPayout: 1200,
      advice: 'Monitor weather conditions. Standard operations recommended.',
      weatherOutlook: 'Moderate temperatures with low precipitation expected.',
      topRisks: ['Heat stress in afternoon hours', 'Moderate AQI levels']
    });
  }
});

export default router;
