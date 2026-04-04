import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import policyRoutes from './routes/policy.js';
import claimsRoutes from './routes/claims.js';
import weatherRoutes from './routes/weather.js';
import aiRoutes from './routes/ai.js';
import { db } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ShramSuraksha API',
    timestamp: new Date().toISOString(),
    workers: db.users.length,
    activePolicies: db.policies.filter(p => p.status === 'active').length,
    totalClaims: db.claims.length
  });
});

// Stats endpoint  
app.get('/api/stats', (req, res) => {
  const totalWorkers = db.users.length;
  const activePolicies = db.policies.filter(p => p.status === 'active').length;
  const totalClaims = db.claims.length;
  const settledClaims = db.claims.filter(c => c.status === 'settled').length;
  const totalPaidOut = db.claims.filter(c => c.status === 'settled').reduce((sum, c) => sum + (c.payoutAmount || 0), 0);
  const avgSettleTime = 87; // seconds (simulated)
  
  res.json({
    totalWorkers,
    activePolicies,
    totalClaims,
    settledClaims,
    totalPaidOut,
    avgSettleTime,
    lossRatio: totalClaims > 0 ? ((settledClaims / totalClaims) * 100).toFixed(1) : 0,
    fraudFlags: db.claims.filter(c => c.fraudFlag).length
  });
});

app.listen(PORT, () => {
  console.log(`🛡️ ShramSuraksha API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
