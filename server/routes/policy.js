import { Router } from 'express';
import { supabase } from '../store.js';

const router = Router();

const PLANS = {
  basic: { weeklyPremium: 29, dailyCoverage: 300, weeklyCoverage: 2100, label: 'Basic' },
  standard: { weeklyPremium: 59, dailyCoverage: 850, weeklyCoverage: 5950, label: 'Standard' },
  premium: { weeklyPremium: 119, dailyCoverage: 1800, weeklyCoverage: 12600, label: 'Premium' }
};

router.get('/plans', (req, res) => res.json(PLANS));

router.get('/user/:userId', async (req, res) => {
  try {
    const { data: policies } = await supabase.from('policies').select('*').eq('userId', req.params.userId);
    res.json(policies || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/activate', async (req, res) => {
  try {
    const { userId, plan, aiPremium } = req.body;
    if (!userId || !plan) return res.status(400).json({ error: 'userId and plan are required' });

    const planData = PLANS[plan];
    if (!planData) return res.status(400).json({ error: 'Invalid plan' });

    await supabase.from('policies').update({ status: 'expired' }).eq('userId', userId).eq('status', 'active');

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 86400000);

    const { data: policy, error } = await supabase.from('policies').insert({
      userId, plan,
      weeklyPremium: aiPremium || planData.weeklyPremium,
      dailyCoverage: planData.dailyCoverage,
      weeklyCoverage: planData.weeklyCoverage,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      aiRecommended: !!aiPremium,
      aiPremium
    }).select().single();

    if (error) throw error;

    res.status(201).json({
      success: true, policy,
      message: `${planData.label} plan activated! You're protected for 7 days.`
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/deactivate/:policyId', async (req, res) => {
  try {
    const { data: policy, error } = await supabase.from('policies').update({ status: 'cancelled' }).eq('id', req.params.policyId).select().single();
    if (error || !policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ success: true, policy });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/all', async (req, res) => {
  try {
    const { data: policies } = await supabase.from('policies').select('*');
    const { data: workers } = await supabase.from('workers').select('*');
    const result = policies?.map(p => {
      const user = workers?.find(u => u.id === p.userId);
      return { ...p, userName: user?.name, userPhone: user?.phone, userPlatform: user?.platform };
    }) || [];
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
