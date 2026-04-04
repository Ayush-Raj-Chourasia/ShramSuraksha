import { Router } from 'express';
import { supabase } from '../store.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, phone, platform, city, zone } = req.body;
    if (!name || !phone || !platform || !city) return res.status(400).json({ error: 'Name, phone, platform, and city are required' });

    const { data: existing } = await supabase.from('workers').select('*').eq('phone', phone).single();
    if (existing) return res.status(400).json({ error: 'Phone number already registered', user: existing });

    const { data: user, error } = await supabase.from('workers').insert({
      name, phone, platform: platform.toLowerCase(), city,
      zone: zone || 'auto',
      gpsLat: 19.0760 + (Math.random() - 0.5) * 0.1,
      gpsLng: 72.8777 + (Math.random() - 0.5) * 0.1,
      riskScore: Math.floor(Math.random() * 60) + 20,
    }).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, user, message: 'Registration successful! Welcome to ShramSuraksha.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const { data: user } = await supabase.from('workers').select('*').eq('phone', phone).single();
    if (!user) return res.status(404).json({ error: 'User not found. Please register first.' });

    const { data: activePolicy } = await supabase.from('policies').select('*').eq('userId', user.id).eq('status', 'active').single();
    const { data: recentClaims } = await supabase.from('claims').select('*').eq('userId', user.id).order('created_at', { ascending: false }).limit(5);

    res.json({ success: true, user, activePolicy, recentClaims, message: `Welcome back, ${user.name}!` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const { data: user } = await supabase.from('workers').select('*').eq('id', req.params.userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: activePolicy } = await supabase.from('policies').select('*').eq('userId', user.id).eq('status', 'active').single();
    const { data: claims } = await supabase.from('claims').select('*').eq('userId', user.id);
    const totalPaidOut = claims?.filter(c => c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0) || 0;

    res.json({ user, activePolicy, claims, totalPaidOut });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/workers', async (req, res) => {
  try {
    const { data: users } = await supabase.from('workers').select('*');
    const { data: policies } = await supabase.from('policies').select('*');
    const { data: claims } = await supabase.from('claims').select('*');

    const workers = users?.map(u => ({
      ...u,
      activePolicy: policies?.find(p => p.userId === u.id && p.status === 'active'),
      totalClaims: claims?.filter(c => c.userId === u.id).length || 0,
      totalPaidOut: claims?.filter(c => c.userId === u.id && c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0) || 0
    })) || [];
    res.json(workers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
