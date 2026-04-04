import { Router } from 'express';
import { Worker, Policy, Claim } from '../models.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, platform, city, zone } = req.body;
    if (!name || !phone || !platform || !city) {
      return res.status(400).json({ error: 'Name, phone, platform, and city are required' });
    }

    const existing = await Worker.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered', user: existing });
    }

    const user = await Worker.create({
      name, phone, platform: platform.toLowerCase(), city,
      zone: zone || 'auto',
      gpsLat: 19.0760 + (Math.random() - 0.5) * 0.1,
      gpsLng: 72.8777 + (Math.random() - 0.5) * 0.1,
      riskScore: Math.floor(Math.random() * 60) + 20,
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, ...user.toObject() },
      message: 'Registration successful! Welcome to ShramSuraksha.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const user = await Worker.findOne({ phone }).lean();
    if (!user) return res.status(404).json({ error: 'User not found. Please register first.' });

    const uid = user._id.toString();
    const activePolicy = await Policy.findOne({ userId: uid, status: 'active' }).lean();
    const recentClaims = await Claim.find({ userId: uid }).sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      success: true,
      user: { id: uid, ...user },
      activePolicy: activePolicy ? { id: activePolicy._id, ...activePolicy } : null,
      recentClaims,
      message: `Welcome back, ${user.name}!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await Worker.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const uid = user._id.toString();
    const activePolicy = await Policy.findOne({ userId: uid, status: 'active' }).lean();
    const claims = await Claim.find({ userId: uid }).lean();
    const totalPaidOut = claims.filter(c => c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0);

    res.json({ user: { id: uid, ...user }, activePolicy, claims, totalPaidOut });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all workers (admin)
router.get('/workers', async (req, res) => {
  try {
    const users = await Worker.find().lean();
    const policies = await Policy.find().lean();
    const claims = await Claim.find().lean();

    const workers = users.map(u => {
      const uid = u._id.toString();
      return {
        id: uid, ...u,
        activePolicy: policies.find(p => p.userId === uid && p.status === 'active'),
        totalClaims: claims.filter(c => c.userId === uid).length,
        totalPaidOut: claims.filter(c => c.userId === uid && c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0)
      };
    });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
