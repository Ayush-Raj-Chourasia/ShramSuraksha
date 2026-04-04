import { Router } from 'express';
import { db, generateId } from '../store.js';

const router = Router();

// Register new worker
router.post('/register', (req, res) => {
  try {
    const { name, phone, platform, city, zone } = req.body;
    
    if (!name || !phone || !platform || !city) {
      return res.status(400).json({ error: 'Name, phone, platform, and city are required' });
    }
    
    // Check if phone already exists
    const existing = db.users.find(u => u.phone === phone);
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered', user: existing });
    }
    
    const user = {
      id: generateId('user-'),
      name,
      phone,
      platform: platform.toLowerCase(),
      city,
      zone: zone || 'auto',
      gpsLat: 19.0760 + (Math.random() - 0.5) * 0.1,
      gpsLng: 72.8777 + (Math.random() - 0.5) * 0.1,
      createdAt: new Date().toISOString(),
      riskScore: Math.floor(Math.random() * 60) + 20,
      totalEarningsProtected: 0
    };
    
    db.users.push(user);
    
    res.status(201).json({ 
      success: true, 
      user,
      message: 'Registration successful! Welcome to ShramSuraksha.' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (simplified - phone based)
router.post('/login', (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const user = db.users.find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }
    
    // Get active policy
    const activePolicy = db.policies.find(p => p.userId === user.id && p.status === 'active');
    
    // Get recent claims
    const recentClaims = db.claims
      .filter(c => c.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    res.json({ 
      success: true, 
      user,
      activePolicy,
      recentClaims,
      message: `Welcome back, ${user.name}!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
router.get('/profile/:userId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const activePolicy = db.policies.find(p => p.userId === user.id && p.status === 'active');
  const claims = db.claims.filter(c => c.userId === user.id);
  const totalPaidOut = claims.filter(c => c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0);
  
  res.json({ user, activePolicy, claims, totalPaidOut });
});

// Get all workers (admin)
router.get('/workers', (req, res) => {
  const workers = db.users.map(u => ({
    ...u,
    activePolicy: db.policies.find(p => p.userId === u.id && p.status === 'active'),
    totalClaims: db.claims.filter(c => c.userId === u.id).length,
    totalPaidOut: db.claims.filter(c => c.userId === u.id && c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0)
  }));
  res.json(workers);
});

export default router;
