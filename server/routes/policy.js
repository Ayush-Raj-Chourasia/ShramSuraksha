import { Router } from 'express';
import { Policy, Worker, Claim } from '../models.js';

const router = Router();

const PLANS = {
  basic: { weeklyPremium: 29, dailyCoverage: 300, weeklyCoverage: 2100, label: 'Basic' },
  standard: { weeklyPremium: 59, dailyCoverage: 850, weeklyCoverage: 5950, label: 'Standard' },
  premium: { weeklyPremium: 119, dailyCoverage: 1800, weeklyCoverage: 12600, label: 'Premium' }
};

router.get('/plans', (req, res) => res.json(PLANS));

// Get user's policies
router.get('/user/:userId', async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.params.userId }).lean();
    res.json(policies.map(p => ({ id: p._id, ...p })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Activate a policy
router.post('/activate', async (req, res) => {
  try {
    const { userId, plan, aiPremium } = req.body;
    if (!userId || !plan) return res.status(400).json({ error: 'userId and plan are required' });

    const planData = PLANS[plan];
    if (!planData) return res.status(400).json({ error: 'Invalid plan' });

    // Deactivate existing
    await Policy.updateMany({ userId, status: 'active' }, { status: 'expired' });

    const now = new Date();
    const policy = await Policy.create({
      userId, plan,
      weeklyPremium: aiPremium || planData.weeklyPremium,
      dailyCoverage: planData.dailyCoverage,
      weeklyCoverage: planData.weeklyCoverage,
      startDate: now,
      endDate: new Date(now.getTime() + 7 * 86400000),
      autoRenew: true,
      aiRecommended: !!aiPremium,
    });

    res.status(201).json({
      success: true,
      policy: { id: policy._id, ...policy.toObject() },
      message: `${planData.label} plan activated! You're protected for 7 days.`
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Deactivate
router.post('/deactivate/:policyId', async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.policyId, { status: 'cancelled' }, { new: true });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ success: true, policy });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// All policies (admin)
router.get('/all', async (req, res) => {
  try {
    const policies = await Policy.find().lean();
    const workers = await Worker.find().lean();
    const result = policies.map(p => {
      const user = workers.find(u => u._id.toString() === p.userId);
      return { id: p._id, ...p, userName: user?.name, userPhone: user?.phone, userPlatform: user?.platform };
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
