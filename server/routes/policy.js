import { Router } from 'express';
import { db, generateId } from '../store.js';

const router = Router();

const PLANS = {
  basic: { weeklyPremium: 29, dailyCoverage: 300, weeklyCoverage: 2100, label: 'Basic' },
  standard: { weeklyPremium: 59, dailyCoverage: 850, weeklyCoverage: 5950, label: 'Standard' },
  premium: { weeklyPremium: 119, dailyCoverage: 1800, weeklyCoverage: 12600, label: 'Premium' }
};

// Get all plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// Get user's policies
router.get('/user/:userId', (req, res) => {
  const policies = db.policies.filter(p => p.userId === req.params.userId);
  res.json(policies);
});

// Create/activate a policy
router.post('/activate', (req, res) => {
  try {
    const { userId, plan, aiPremium } = req.body;
    
    if (!userId || !plan) {
      return res.status(400).json({ error: 'userId and plan are required' });
    }
    
    const planData = PLANS[plan];
    if (!planData) {
      return res.status(400).json({ error: 'Invalid plan. Choose: basic, standard, premium' });
    }
    
    // Deactivate any existing active policy
    db.policies.forEach(p => {
      if (p.userId === userId && p.status === 'active') {
        p.status = 'expired';
      }
    });
    
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 86400000);
    
    const policy = {
      id: generateId('policy-'),
      userId,
      plan,
      weeklyPremium: aiPremium || planData.weeklyPremium,
      dailyCoverage: planData.dailyCoverage,
      weeklyCoverage: planData.weeklyCoverage,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      autoRenew: true,
      aiRecommended: !!aiPremium,
      riskFactors: [],
      createdAt: now.toISOString()
    };
    
    db.policies.push(policy);
    
    res.status(201).json({ 
      success: true, 
      policy,
      message: `${planData.label} plan activated! You're protected for 7 days.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate a policy
router.post('/deactivate/:policyId', (req, res) => {
  const policy = db.policies.find(p => p.id === req.params.policyId);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  
  policy.status = 'cancelled';
  res.json({ success: true, policy });
});

// Get all active policies (admin)
router.get('/all', (req, res) => {
  const policies = db.policies.map(p => {
    const user = db.users.find(u => u.id === p.userId);
    return { ...p, userName: user?.name, userPhone: user?.phone, userPlatform: user?.platform };
  });
  res.json(policies);
});

export default router;
